import "server-only";
import { db } from "./db";

export async function currentTerm() {
  return (await db.term.findFirst({ where: { isCurrent: true } })) ?? (await db.term.findFirst({ orderBy: { startDate: "desc" } }));
}

type InvoiceWithPayments = { amount: number; payments: { amount: number }[] };

export function invoiceTotals(invoices: InvoiceWithPayments[]) {
  const billed = invoices.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.reduce((s, i) => s + i.payments.reduce((p, x) => p + x.amount, 0), 0);
  return { billed, paid, balance: billed - paid };
}

export function invoiceStatus(inv: InvoiceWithPayments) {
  const { paid, balance } = invoiceTotals([inv]);
  if (balance <= 0) return "PAID";
  return paid > 0 ? "PARTIAL" : "UNPAID";
}

/** Messages a parent should see: school-wide parent notices plus notices for their children's classes. */
export async function messagesForParent(parentId: string) {
  const kids = await db.student.findMany({ where: { parentId }, select: { classId: true } });
  return db.message.findMany({
    where: {
      OR: [{ audience: "ALL_PARENTS" }, { audience: "CLASS", classId: { in: kids.map((k) => k.classId) } }],
    },
    include: { sender: true, classRoom: true },
    orderBy: { createdAt: "desc" },
  });
}
