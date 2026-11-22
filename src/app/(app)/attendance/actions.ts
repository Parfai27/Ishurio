"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AttendanceStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const STATUSES = new Set<AttendanceStatus>(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

export async function saveAttendance(form: FormData) {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  const classId = String(form.get("classId"));
  const dateStr = String(form.get("date"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new Error("Invalid date");
  const date = new Date(dateStr);

  const students = await db.student.findMany({ where: { classId }, select: { id: true } });
  const entries = students
    .map((s) => ({ studentId: s.id, status: form.get(`s_${s.id}`) as AttendanceStatus }))
    .filter((e) => STATUSES.has(e.status));

  await db.$transaction(
    entries.map((e) =>
      db.attendanceRecord.upsert({
        where: { studentId_date: { studentId: e.studentId, date } },
        create: { ...e, date, recordedById: user.userId },
        update: { status: e.status, recordedById: user.userId },
      }),
    ),
  );

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  redirect(`/attendance?class=${classId}&date=${dateStr}&msg=${encodeURIComponent(`Saved attendance for ${entries.length} students.`)}`);
}
