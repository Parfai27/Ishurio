import { CalendarCheck, Check } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateStr, fullName, todayISO } from "@/lib/format";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { saveAttendance } from "./actions";

export const metadata = { title: "Attendance" };

const OPTIONS = [
  { value: "PRESENT", label: "Present", cls: "peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600" },
  { value: "LATE", label: "Late", cls: "peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500" },
  { value: "ABSENT", label: "Absent", cls: "peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600" },
  { value: "EXCUSED", label: "Excused", cls: "peer-checked:bg-sky-600 peer-checked:text-white peer-checked:border-sky-600" },
];

export default async function AttendancePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  const sp = await searchParams;
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : todayISO();

  // Teachers default to (and are listed first) the class they teach.
  const classes = await db.classRoom.findMany({ orderBy: { name: "asc" } });
  const mine = classes.find((c) => c.teacherId === user.userId);
  const classId = sp.class ?? mine?.id ?? classes[0]?.id;
  const cls = classes.find((c) => c.id === classId);

  const students = cls
    ? await db.student.findMany({
        where: { classId: cls.id },
        include: { attendance: { where: { date: new Date(date) } } },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      })
    : [];
  const alreadyTaken = students.some((s) => s.attendance.length);

  return (
    <>
      <PageHeader title="Attendance" subtitle={cls ? `${cls.name} · ${dateStr(date)}` : undefined} />
      <Flash message={sp.msg} />
      <form className="mb-4 flex flex-wrap gap-2">
        <select name="class" defaultValue={classId} className="input max-w-[12rem]">
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" name="date" defaultValue={date} max={todayISO()} className="input max-w-[11rem]" />
        <button className="btn-ghost"><CalendarCheck className="h-4 w-4" aria-hidden="true" />Open register</button>
      </form>

      {cls && (
        <form action={saveAttendance} className="card">
          <input type="hidden" name="classId" value={cls.id} />
          <input type="hidden" name="date" value={date} />
          <div className="flex items-center justify-between border-b border-black/[.08] px-4 py-3 text-sm">
            <span className="text-stone-600">{alreadyTaken ? "Register already taken. Changes overwrite it." : "Everyone starts as present. Mark the exceptions."}</span>
          </div>
          <ul className="divide-y divide-black/[.06]">
            {students.map((s) => {
              const current = s.attendance[0]?.status ?? "PRESENT";
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                  <Link href={`/students/${s.id}`} className="text-sm font-medium hover:underline">{fullName(s)}</Link>
                  <div className="flex gap-1">
                    {OPTIONS.map((o) => (
                      <label key={o.value} className="cursor-pointer">
                        <input type="radio" name={`s_${s.id}`} value={o.value} defaultChecked={current === o.value} className="peer sr-only" />
                        <span className={`inline-block rounded-md border border-black/[.08] px-2.5 py-1 text-xs text-stone-600 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-100 ${o.cls}`}>
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          {!students.length && <Empty>No students in this class.</Empty>}
          {!!students.length && (
            <div className="border-t border-black/[.08] px-4 py-3">
              <button className="btn"><Check className="h-4 w-4" aria-hidden="true" />Save register</button>
            </div>
          )}
        </form>
      )}
      {!classes.length && <div className="card"><Empty>Create a class first.</Empty></div>}
    </>
  );
}
