import { Check } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fullName, grade } from "@/lib/format";
import { currentTerm } from "@/lib/queries";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { saveResults } from "./actions";

export const metadata = { title: "Results" };

export default async function ResultsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  const sp = await searchParams;
  const [classes, subjects, terms, cur] = await Promise.all([
    db.classRoom.findMany({ orderBy: { name: "asc" } }),
    db.subject.findMany({ orderBy: { name: "asc" } }),
    db.term.findMany({ orderBy: { startDate: "desc" } }),
    currentTerm(),
  ]);
  const classId = sp.class ?? classes.find((c) => c.teacherId === user.userId)?.id ?? classes[0]?.id;
  const termId = sp.term ?? cur?.id;
  const subjectId = sp.subject ?? subjects[0]?.id;
  const ready = classId && termId && subjectId;

  const students = ready
    ? await db.student.findMany({
        where: { classId },
        include: { results: { where: { termId } } },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      })
    : [];

  // Class summary: each student's average across all subjects this term.
  const summary = students
    .map((s) => ({ s, avg: s.results.length ? s.results.reduce((a, r) => a + r.score, 0) / s.results.length : null }))
    .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

  return (
    <>
      <PageHeader title="Results" subtitle="Enter scores out of 100 for one subject at a time." />
      <Flash message={sp.msg} />
      <form className="mb-4 flex flex-wrap gap-2">
        <select name="class" defaultValue={classId} className="input max-w-[10rem]">
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="term" defaultValue={termId} className="input max-w-[12rem]">
          {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select name="subject" defaultValue={subjectId} className="input max-w-[12rem]">
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn-ghost">Open</button>
      </form>

      {!ready && <div className="card"><Empty>You need at least one class, term and subject. Admins can add them under Classes and Terms &amp; subjects.</Empty></div>}

      {ready && (
        <div className="grid gap-6 lg:grid-cols-5">
          <form action={saveResults} className="card lg:col-span-3">
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="termId" value={termId} />
            <input type="hidden" name="subjectId" value={subjectId} />
            <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">
              {subjects.find((s) => s.id === subjectId)?.name} scores
            </h2>
            <table className="table">
              <thead><tr><th>Student</th><th className="w-32">Score</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{fullName(s)}</td>
                    <td>
                      <input
                        name={`s_${s.id}`}
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        defaultValue={s.results.find((r) => r.subjectId === subjectId)?.score ?? ""}
                        className="input py-1 text-right tabular-nums"
                        aria-label={`Score for ${fullName(s)}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!students.length && <Empty>No students in this class.</Empty>}
            {!!students.length && <div className="border-t border-black/[.08] px-4 py-3"><button className="btn"><Check className="h-4 w-4" aria-hidden="true" />Save scores</button></div>}
          </form>

          <section className="card lg:col-span-2">
            <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Class ranking · all subjects</h2>
            <table className="table">
              <thead><tr><th>#</th><th>Student</th><th className="text-right">Avg</th><th></th></tr></thead>
              <tbody>
                {summary.map(({ s, avg }, i) => (
                  <tr key={s.id}>
                    <td className="text-stone-400 tabular-nums">{avg !== null ? i + 1 : "—"}</td>
                    <td>{fullName(s)}</td>
                    <td className="text-right tabular-nums">{avg !== null ? `${avg.toFixed(1)} ${grade(avg)}` : "—"}</td>
                    <td className="text-right"><Link href={`/students/${s.id}/report?term=${termId}`} className="text-xs text-brand-600 hover:underline">Report</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </>
  );
}
