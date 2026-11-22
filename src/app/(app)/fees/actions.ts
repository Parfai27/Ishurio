"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, type FormState } from "@/lib/form-state";

const BillInput = z.object({
  classId: z.string().min(1, "Choose a class"),
  termId: z.string().min(1, "Choose a term"),
  description: z.string().trim().min(1, "Description is required"),
  amount: z.coerce.number().int("Use a whole amount").positive("Amount must be above zero"),
  dueDate: z.string().optional(),
});

export async function billClass(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser(["ADMIN", "ACCOUNTANT"]);
  const parsed = BillInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message, form);
  const { classId, termId, description, amount, dueDate } = parsed.data;

  const students = await db.student.findMany({ where: { classId }, select: { id: true } });
  if (!students.length) return fail("That class has no students.", form);
  await db.invoice.createMany({
    data: students.map((s) => ({ studentId: s.id, termId, description, amount, dueDate: dueDate ? new Date(dueDate) : null })),
  });
  revalidatePath("/fees");
  redirect(`/fees?class=${classId}&msg=${encodeURIComponent(`Created ${students.length} invoices.`)}`);
}

const PaymentInput = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().int("Use a whole amount").positive("Amount must be above zero"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK"]),
  reference: z.string().trim().optional(),
});

export async function recordPayment(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "ACCOUNTANT"]);
  const parsed = PaymentInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message, form);
  const { invoiceId, amount, method, reference } = parsed.data;

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice) return fail("Invoice not found.", form);
  const balance = invoice.amount - invoice.payments.reduce((s, p) => s + p.amount, 0);
  if (amount > balance) return fail(`That is more than the balance of ${balance.toLocaleString()}.`, form);

  const payment = await db.payment.create({
    data: { invoiceId, amount, method, reference: reference || null, recordedById: user.userId },
  });
  revalidatePath("/fees");
  redirect(`/fees/receipt/${payment.id}`);
}
