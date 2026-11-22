"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveResults(form: FormData) {
  await requireUser(["ADMIN", "TEACHER"]);
  const classId = String(form.get("classId"));
  const termId = String(form.get("termId"));
  const subjectId = String(form.get("subjectId"));

  const students = await db.student.findMany({ where: { classId }, select: { id: true } });
  const ops = [];
  let saved = 0;
  const bad: string[] = [];
  for (const s of students) {
    const raw = String(form.get(`s_${s.id}`) ?? "").trim();
    const key = { studentId_subjectId_termId: { studentId: s.id, subjectId, termId } };
    if (raw === "") {
      // Clearing a box removes the score.
      ops.push(db.result.deleteMany({ where: { studentId: s.id, subjectId, termId } }));
      continue;
    }
    const score = Number(raw);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      bad.push(raw);
      continue;
    }
    ops.push(db.result.upsert({ where: key, create: { studentId: s.id, subjectId, termId, score }, update: { score } }));
    saved++;
  }
  await db.$transaction(ops);

  revalidatePath("/results");
  const msg = bad.length ? `Saved ${saved} scores. Skipped ${bad.length} that were not between 0 and 100.` : `Saved ${saved} scores.`;
  redirect(`/results?class=${classId}&term=${termId}&subject=${subjectId}&msg=${encodeURIComponent(msg)}`);
}
