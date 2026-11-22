"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const back = (path: string, msg: string): never => redirect(`${path}?msg=${encodeURIComponent(msg)}`);

// ---- Classes ----

export async function saveClass(form: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const teacherId = String(form.get("teacherId") ?? "") || null;
  if (!name) back("/classes", "Class name is required.");
  const clash = await db.classRoom.findUnique({ where: { name } });
  if (clash && clash.id !== id) back("/classes", `A class called ${name} already exists.`);
  if (id) await db.classRoom.update({ where: { id }, data: { name, teacherId } });
  else await db.classRoom.create({ data: { name, teacherId } });
  revalidatePath("/classes");
  back("/classes", "Class saved.");
}

export async function deleteClass(form: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(form.get("id"));
  const count = await db.student.count({ where: { classId: id } });
  if (count) back("/classes", "Move or remove the students in this class first.");
  await db.classRoom.delete({ where: { id } });
  revalidatePath("/classes");
  back("/classes", "Class deleted.");
}

// ---- Users ----

const UserInput = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Email is not valid"),
  phone: z.string().trim().optional(),
  role: z.enum(["ADMIN", "TEACHER", "ACCOUNTANT", "PARENT"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createUser(form: FormData) {
  await requireUser(["ADMIN"]);
  const parsed = UserInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) back("/users", parsed.error!.issues[0].message);
  const { password, ...data } = parsed.data!;
  if (await db.user.findUnique({ where: { email: data.email } })) back("/users", "That email is already in use.");
  await db.user.create({ data: { ...data, phone: data.phone || null, passwordHash: await bcrypt.hash(password, 10) } });
  revalidatePath("/users");
  back("/users", `Account created for ${data.name}.`);
}

export async function resetPassword(form: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(form.get("id"));
  const password = String(form.get("password") ?? "");
  if (password.length < 8) back("/users", "Password must be at least 8 characters.");
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  back("/users", "Password updated. Share it with the user privately.");
}

// ---- Terms and subjects ----

export async function createTerm(form: FormData) {
  await requireUser(["ADMIN"]);
  const name = String(form.get("name") ?? "").trim();
  const start = String(form.get("startDate") ?? "");
  const end = String(form.get("endDate") ?? "");
  if (!name || !start || !end) back("/settings", "Term name and dates are required.");
  if (end < start) back("/settings", "The term must end after it starts.");
  if (await db.term.findUnique({ where: { name } })) back("/settings", "A term with that name exists.");
  const isFirst = (await db.term.count()) === 0;
  await db.term.create({ data: { name, startDate: new Date(start), endDate: new Date(end), isCurrent: isFirst } });
  revalidatePath("/settings");
  back("/settings", "Term added.");
}

export async function setCurrentTerm(form: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(form.get("id"));
  await db.$transaction([
    db.term.updateMany({ data: { isCurrent: false } }),
    db.term.update({ where: { id }, data: { isCurrent: true } }),
  ]);
  revalidatePath("/", "layout");
  back("/settings", "Current term changed.");
}

export async function createSubject(form: FormData) {
  await requireUser(["ADMIN"]);
  const name = String(form.get("name") ?? "").trim();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  if (!name || !code) back("/settings", "Subject name and code are required.");
  if (await db.subject.findFirst({ where: { OR: [{ name }, { code }] } })) back("/settings", "That subject name or code exists.");
  await db.subject.create({ data: { name, code } });
  revalidatePath("/settings");
  back("/settings", "Subject added.");
}

export async function deleteSubject(form: FormData) {
  await requireUser(["ADMIN"]);
  await db.subject.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/settings");
  back("/settings", "Subject and its scores deleted.");
}
