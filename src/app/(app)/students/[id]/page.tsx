import { BookOpenCheck, CalendarCheck, FileText, Pencil, Wallet } from "lucide-react";
import Link from "next/link";
import { requireStudentAccess } from "@/lib/access";
import { db } from "@/lib/db";
import { dateStr, fullName, grade, money } from "@/lib/format";
import { currentTerm, invoiceStatus, invoiceTotals } from "@/lib/queries";
import { Badge, Empty, Flash, PageHeader, Stat } from "@/components/ui";
import { deleteStudent } from "../actions";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const { msg } = await searchParams;
  const { user, student } = await requireStudentAccess(id);
  const term = await currentTerm();

  const [attendance, results, invoices] = await Promise.all([
    db.attendanceRecord.findMany({ where: { studentId: id }, orderBy: { date: "desc" } }),
    db.result.findMany({ where: { studentId: id, termId: term?.id ?? "" }, include: { subject: true }, orderBy: { subject: { name: "asc" } } }),
    db.invoice.findMany({ where: { studentId: id }, include: { payments: { orderBy: { paidAt: "desc" } }, term: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const count = (s: string) => attendance.filter((a) => a.status === s).length;
  const attended = count("PRESENT") + count("LATE");
  const avg = results.length ? results.reduce((s, r) => s + r.score, 0) / results.length : null;
  const fees = invoiceTotals(invoices);

  return (
    <>
      <PageHeader
        title={fullName(student)}
        subtitle={`${student.classRoom.name} · ${student.admissionNo}${student.dateOfBirth ? ` · Born ${dateStr(student.dateOfBirth)}` : ""}`}
        actions={
          <>
            {term && <Link href={`/students/${id}/report?term=${term.id}`} className="btn-ghost"><FileText className="h-4 w-4" aria-hidden="true" />Report card</Link>}
            {user.role === "ADMIN" && <Link href={`/students/${id}/edit`} className="btn-ghost"><Pencil className="h-4 w-4" aria-hidden="true" />Edit</Link>}
          </>
        }
      />
      <Flash message={msg} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={CalendarCheck} label="Attendance" value={attendance.length ? `${Math.round((attended / attendance.length) * 100)}%` : "—"} hint={`${count("ABSENT")} absent · ${count("LATE")} late · ${count("EXCUSED")} excused`} />
        <Stat icon={BookOpenCheck} label={`Average · ${term?.name ?? "term"}`} value={avg !== null ? `${avg.toFixed(1)}%` : "—"} hint={avg !== null ? `Grade ${grade(avg)}` : "No results yet"} />
        <Stat icon={Wallet} label="Fee balance" value={money(fees.balance)} hint={`${money(fees.paid)} paid of ${money(fees.billed)}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Results · {term?.name}</h2>
          <table className="table">
            <thead><tr><th>Subject</th><th className="text-right">Score</th><th className="text-right">Grade</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.subject.name}</td>
                  <td className="text-right tabular-nums">{r.score}</td>
                  <td className="text-right font-medium">{grade(r.score)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!results.length && <Empty>No results entered this term.</Empty>}
        </section>

        <section className="card">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Recent attendance</h2>
          <table className="table">
            <tbody>
              {attendance.slice(0, 10).map((a) => (
                <tr key={a.id}><td>{dateStr(a.date)}</td><td className="text-right"><Badge>{a.status}</Badge></td></tr>
              ))}
            </tbody>
          </table>
          {!attendance.length && <Empty>No attendance recorded.</Empty>}
        </section>

        <section className="card lg:col-span-2">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Fees</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Invoice</th><th>Term</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th>Status</th><th>Payments</th></tr></thead>
              <tbody>
                {invoices.map((inv) => {
                  const t = invoiceTotals([inv]);
                  return (
                    <tr key={inv.id}>
                      <td>{inv.description}</td>
                      <td className="text-stone-600">{inv.term.name}</td>
                      <td className="text-right tabular-nums">{money(inv.amount)}</td>
                      <td className="text-right tabular-nums">{money(t.paid)}</td>
                      <td><Badge>{invoiceStatus(inv)}</Badge></td>
                      <td className="text-xs text-stone-500">
                        {inv.payments.map((p) => <div key={p.id}>{dateStr(p.paidAt)} · {money(p.amount)} · {p.method.replace("_", " ").toLowerCase()}</div>)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!invoices.length && <Empty>No invoices.</Empty>}
        </section>

        <section className="card p-4 text-sm lg:col-span-2">
          <h2 className="mb-2 font-semibold">Parent or guardian</h2>
          {student.parent ? (
            <p className="text-stone-600">{student.parent.name} · {student.parent.email}{student.parent.phone ? ` · ${student.parent.phone}` : ""}</p>
          ) : (
            <p className="text-stone-500">No parent linked.</p>
          )}
        </section>
      </div>

      {user.role === "ADMIN" && (
        <form action={deleteStudent} className="no-print mt-8">
          <input type="hidden" name="id" value={id} />
          <button className="text-sm text-red-600 hover:underline">Remove this student and all their records</button>
        </form>
      )}
    </>
  );
}
