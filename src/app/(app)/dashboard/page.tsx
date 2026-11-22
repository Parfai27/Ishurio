import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateStr, fullName, money, todayISO } from "@/lib/format";
import { currentTerm, invoiceTotals, messagesForParent } from "@/lib/queries";
import { ArrowRight, CalendarCheck, CircleAlert, MessageSquareText, School, Users, Wallet } from "lucide-react";
import { Badge, Empty, PageHeader, Panel, Stat } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireUser();
  return user.role === "PARENT" ? <ParentDashboard userId={user.userId} name={user.name} /> : <StaffDashboard name={user.name} />;
}

async function StaffDashboard({ name }: { name: string }) {
  const term = await currentTerm();
  const today = new Date(todayISO());
  const [students, classes, todayAttendance, invoices, messages, lastAttendance] = await Promise.all([
    db.student.count(),
    db.classRoom.findMany({ include: { _count: { select: { students: true } }, teacher: true }, orderBy: { name: "asc" } }),
    db.attendanceRecord.groupBy({ by: ["status"], where: { date: today }, _count: true }),
    db.invoice.findMany({ where: term ? { termId: term.id } : undefined, include: { payments: true } }),
    db.message.findMany({ take: 4, orderBy: { createdAt: "desc" }, include: { sender: true, classRoom: true } }),
    db.attendanceRecord.findFirst({ orderBy: { date: "desc" }, select: { date: true } }),
  ]);
  const fees = invoiceTotals(invoices);
  const marked = todayAttendance.reduce((s, r) => s + r._count, 0);
  const present = todayAttendance.filter((r) => r.status === "PRESENT" || r.status === "LATE").reduce((s, r) => s + r._count, 0);

  return (
    <>
      <PageHeader title={`Hello, ${name}`} subtitle={term ? `${term.name} · ${dateStr(new Date())}` : dateStr(new Date())} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Students" value={students} hint={`${classes.length} classes`} />
        <Stat
          icon={CalendarCheck}
          label="Present today"
          value={marked ? `${Math.round((present / marked) * 100)}%` : "—"}
          hint={
            marked ? (
              `${present} of ${marked} marked`
            ) : (
              <Link href="/attendance" className="text-brand-600 hover:underline">
                Not taken yet{lastAttendance ? ` · last ${dateStr(lastAttendance.date)}` : ""}
              </Link>
            )
          }
        />
        <Stat
          icon={Wallet}
          label="Fees collected"
          value={money(fees.paid)}
          hint={fees.billed ? `${Math.round((fees.paid / fees.billed) * 100)}% of ${money(fees.billed)}` : "No invoices this term"}
        />
        <Stat
          icon={CircleAlert}
          label="Outstanding"
          value={money(fees.balance)}
          hint={<Link href="/fees?status=owing" className="text-brand-600 hover:underline">See who owes</Link>}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel title="Classes" icon={School} className="lg:col-span-3">
          <table className="table">
            <thead>
              <tr><th>Class</th><th>Class teacher</th><th className="text-right">Students</th></tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/students?class=${c.id}`} className="font-medium hover:underline">{c.name}</Link></td>
                  <td className="text-stone-600">{c.teacher?.name ?? "—"}</td>
                  <td className="text-right tabular-nums">{c._count.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!classes.length && <Empty>No classes yet.</Empty>}
        </Panel>
        <Panel title="Latest messages" icon={MessageSquareText} className="lg:col-span-2" action={<Link href="/messages" className="inline-flex items-center gap-1 text-[13px] text-brand-700 hover:underline">All <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}>
          <ul className="divide-y divide-black/[.06]">
            {messages.map((m) => (
              <li key={m.id} className="px-5 py-3.5">
                <p className="text-sm font-medium">{m.title}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {m.classRoom?.name ?? (m.audience === "STAFF" ? "Staff" : "All parents")} · {dateStr(m.createdAt)}
                </p>
              </li>
            ))}
          </ul>
          {!messages.length && <Empty icon={MessageSquareText}>No messages sent yet.</Empty>}
        </Panel>
      </div>
    </>
  );
}

async function ParentDashboard({ userId, name }: { userId: string; name: string }) {
  const term = await currentTerm();
  const [children, messages] = await Promise.all([
    db.student.findMany({
      where: { parentId: userId },
      include: {
        classRoom: true,
        invoices: { include: { payments: true } },
        attendance: { orderBy: { date: "desc" }, take: 20 },
        results: { where: { termId: term?.id ?? "" } },
      },
    }),
    messagesForParent(userId),
  ]);

  return (
    <>
      <PageHeader title={`Hello, ${name}`} subtitle={term?.name} />
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((c) => {
          const fees = invoiceTotals(c.invoices);
          const present = c.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
          const avg = c.results.length ? c.results.reduce((s, r) => s + r.score, 0) / c.results.length : null;
          return (
            <Link key={c.id} href={`/students/${c.id}`} className="card group block p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-[0_12px_24px_-16px_rgb(0_0_0/.3)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{fullName(c)}</p>
                  <p className="text-sm text-stone-500">{c.classRoom.name} · {c.admissionNo}</p>
                </div>
                <Badge tone={fees.balance > 0 ? "UNPAID" : "PAID"}>{fees.balance > 0 ? `Owes ${money(fees.balance)}` : "Fees cleared"}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-stone-500">Attendance (recent)</p>
                  <p className="font-medium">{c.attendance.length ? `${Math.round((present / c.attendance.length) * 100)}%` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500">Average score</p>
                  <p className="font-medium">{avg !== null ? `${avg.toFixed(1)}%` : "—"}</p>
                </div>
              </div>
            </Link>
          );
        })}
        {!children.length && (
          <div className="card">
            <Empty>No children are linked to your account. Please contact the school.</Empty>
          </div>
        )}
      </div>
      <Panel title="Messages from school" icon={MessageSquareText} className="mt-6">
        <ul className="divide-y divide-black/[.06]">
          {messages.slice(0, 5).map((m) => (
            <li key={m.id} className="px-4 py-3">
              <p className="text-sm font-medium">{m.title}</p>
              <p className="mt-1 text-sm text-stone-600">{m.body}</p>
              <p className="mt-1 text-xs text-stone-400">{m.sender.name} · {dateStr(m.createdAt)}</p>
            </li>
          ))}
        </ul>
        {!messages.length && <Empty icon={MessageSquareText}>No messages yet.</Empty>}
      </Panel>
    </>
  );
}
