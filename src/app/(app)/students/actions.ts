"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, type FormState } from "@/lib/form-state";

const StudentInput = z.object({
  admissionNo: z.string().trim().min(1, "Admission number is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().optional(),
  classId: z.string().min(1, "Choose a class"),
  parentName: z.string().trim().optional(),
  parentEmail: z.string().trim().toLowerCase().email("Parent email is not valid").optional().or(z.literal("")),
  parentPhone: z.string().trim().optional(),
});

export async function saveStudent(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const id = String(form.get("id") ?? "") || null;
  const parsed = StudentInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message, form);
  const { parentName, parentEmail, parentPhone, dateOfBirth, ...data } = parsed.data;

  // Validate everything before writing anything, so a failed save leaves no stray parent account.
  const clash = await db.student.findUnique({ where: { admissionNo: data.admissionNo } });
  if (clash && clash.id !== id) return fail(`Admission number ${data.admissionNo} is already used.`, form);
  const existingParent = parentEmail ? await db.user.findUnique({ where: { email: parentEmail } }) : null;
  if (existingParent && existingParent.role !== "PARENT") return fail("That parent email belongs to a staff account.", form);
  const newParent = parentEmail && !existingParent;
  const passwordHash = newParent ? await bcrypt.hash(randomBytes(16).toString("hex"), 10) : "";

  const student = await db.$transaction(async (tx) => {
    let parentId = existingParent?.id ?? null;
    if (newParent) {
      const created = await tx.user.create({
        data: { name: parentName || parentEmail, email: parentEmail, phone: parentPhone || null, role: "PARENT", passwordHash },
      });
      parentId = created.id;
    }
    const payload = { ...data, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, parentId };
    return id ? tx.student.update({ where: { id }, data: payload }) : tx.student.create({ data: payload });
  });

  revalidatePath("/students");
  const note = newParent ? "Parent account created. Set its password on the Users page." : "Saved.";
  redirect(`/students/${student.id}?msg=${encodeURIComponent(note)}`);
}

export async function deleteStudent(form: FormData) {
  await requireUser(["ADMIN"]);
  await db.student.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/students");
  redirect("/students?msg=Student%20removed.");
}
