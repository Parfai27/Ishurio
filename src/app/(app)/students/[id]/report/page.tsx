import { requireStudentAccess } from "@/lib/access";
import { db } from "@/lib/db";
import { SCHOOL_NAME, dateStr, fullName, grade } from "@/lib/format";
import { currentTerm } from "@/lib/queries";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Report card" };

export default async function ReportCard({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const { id } = await params;
  const { student } = await requireStudentAccess(id);
  const termId = (await searchParams).term;
  const term = termId ? await db.term.findUnique({ where: { id: termId } }) : await currentTerm();
  if (!term) return <p className="text-sm text-stone-600">No term found.</p>;

  const [results, classResults, attendance] = await Promise.all([
    db.result.findMany({ where: { studentId: id, termId: term.id }, include: { subject: true }, orderBy: { subject: { name: "asc" } } }),
    db.result.groupBy({ by: ["studentId"], where: { termId: term.id, student: { classId: student.classId } }, _avg: { score: true } }),
    db.attendanceRecord.groupBy({
      by: ["status"],
      where: { studentId: id, date: { gte: term.startDate, lte: term.endDate } },
      _count: true,
    }),
  ]);

  const avg = results.length ? results.reduce((s, r) => s + r.score, 0) / results.length : null;
  const ranked = classResults.map((r) => r._avg.score ?? 0).sort((a, b) => b - a);
  const position = avg !== null ? ranked.findIndex((s) => s <= avg + 1e-9) + 1 : null;
  const days = attendance.reduce((s, a) => s + a._count, 0);
  const present = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").reduce((s, a) => s + a._count, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <article className="card p-8">
        <header className="border-b border-black/[.08] pb-4 text-center">
          <h1 className="text-xl font-semibold">{SCHOOL_NAME}</h1>
          <p className="text-sm text-stone-500">Student report · {term.name}</p>
        </header>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 py-5 text-sm">
          <Row k="Name" v={fullName(student)} />
          <Row k="Admission no." v={student.admissionNo} />
          <Row k="Class" v={student.classRoom.name} />
          <Row k="Position" v={position ? `${position} of ${ranked.length}` : "—"} />
          <Row k="Attendance" v={days ? `${present} of ${days} days` : "—"} />
          <Row k="Term dates" v={`${dateStr(term.startDate)} – ${dateStr(term.endDate)}`} />
        </dl>
        <table className="table border-t border-black/[.08]">
          <thead><tr><th>Subject</th><th className="text-right">Score (%)</th><th className="text-right">Grade</th></tr></thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}><td>{r.subject.name}</td><td className="text-right tabular-nums">{r.score}</td><td className="text-right font-medium">{grade(r.score)}</td></tr>
            ))}
            <tr className="font-semibold">
              <td>Average</td>
              <td className="text-right tabular-nums">{avg !== null ? avg.toFixed(1) : "—"}</td>
              <td className="text-right">{avg !== null ? grade(avg) : "—"}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-6 text-xs text-stone-500">Grading: A 80–100 · B 70–79 · C 60–69 · D 50–59 · E 40–49 · F below 40</p>
        <div className="mt-10 grid grid-cols-2 gap-10 text-xs text-stone-500">
          <div className="border-t border-stone-300 pt-1">Class teacher</div>
          <div className="border-t border-stone-300 pt-1">Head teacher</div>
        </div>
      </article>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stone-100 pb-1">
      <dt className="text-stone-500">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
