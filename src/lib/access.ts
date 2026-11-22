import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "./auth";
import { db } from "./db";

/** Staff can see any student; a parent only their own children. Anything else is a 404. */
export async function requireStudentAccess(studentId: string) {
  const user = await requireUser();
  const student = await db.student.findUnique({ where: { id: studentId }, include: { classRoom: true, parent: true } });
  if (!student) notFound();
  if (user.role === "PARENT" && student.parentId !== user.userId) notFound();
  return { user, student };
}
