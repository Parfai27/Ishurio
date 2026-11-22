import { Plus, Search } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireUser, STAFF } from "@/lib/auth";
import { db } from "@/lib/db";
import { fullName, money } from "@/lib/format";
import { invoiceTotals } from "@/lib/queries";
import { Badge, Empty, Flash, PageHeader } from "@/components/ui";

export const metadata = { title: "Students" };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser(STAFF);
  const { class: classId, q, msg } = await searchParams;

  const where: Prisma.StudentWhereInput = {
    ...(classId ? { classId } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { admissionNo: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [classes, students] = await Promise.all([
    db.classRoom.findMany({ orderBy: { name: "asc" } }),
    db.student.findMany({
      where,
      include: { classRoom: true, parent: true, invoices: { include: { payments: true } } },
      orderBy: [{ classRoom: { name: "asc" } }, { lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${students.length} ${students.length === 1 ? "student" : "students"}`}
        actions={user.role === "ADMIN" && <Link href="/students/new" className="btn"><Plus className="h-4 w-4" aria-hidden="true" />Add student</Link>}
      />
      <Flash message={msg} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name or admission no." className="input max-w-xs" />
        <select name="class" defaultValue={classId ?? ""} className="input max-w-[12rem]">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-ghost"><Search className="h-4 w-4" aria-hidden="true" />Filter</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Adm. no.</th><th>Name</th><th>Class</th><th>Parent</th><th className="text-right">Fee balance</th></tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const { balance } = invoiceTotals(s.invoices);
              return (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="font-mono text-xs text-stone-500">{s.admissionNo}</td>
                  <td><Link href={`/students/${s.id}`} className="font-medium hover:underline">{fullName(s)}</Link></td>
                  <td>{s.classRoom.name}</td>
                  <td className="text-stone-600">{s.parent ? <>{s.parent.name}<span className="block text-xs text-stone-400">{s.parent.phone}</span></> : "—"}</td>
                  <td className="text-right">{balance > 0 ? <Badge tone="UNPAID">{money(balance)}</Badge> : <Badge tone="PAID">Cleared</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!students.length && <Empty>No students match.</Empty>}
      </div>
    </>
  );
}
