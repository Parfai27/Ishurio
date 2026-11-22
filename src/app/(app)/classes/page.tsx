import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { deleteClass, saveClass } from "../admin-actions";

export const metadata = { title: "Classes" };

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireUser(["ADMIN"]);
  const { msg } = await searchParams;
  const [classes, teachers] = await Promise.all([
    db.classRoom.findMany({ include: { _count: { select: { students: true } } }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { role: "TEACHER" }, orderBy: { name: "asc" } }),
  ]);

  const teacherSelect = (value?: string | null) => (
    <select name="teacherId" defaultValue={value ?? ""} className="input py-1.5" aria-label="Class teacher">
      <option value="">No class teacher</option>
      {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  );

  return (
    <>
      <PageHeader title="Classes" />
      <Flash message={msg} />
      <div className="card">
        <ul className="divide-y divide-black/[.06]">
          {classes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
              <form action={saveClass} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="name" defaultValue={c.name} className="input w-32 py-1.5" aria-label="Class name" />
                <div className="w-52">{teacherSelect(c.teacherId)}</div>
                <span className="text-sm text-stone-500">{c._count.students} students</span>
                <button className="btn-ghost py-1.5">Save</button>
              </form>
              {c._count.students === 0 && (
                <form action={deleteClass}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-xs text-red-600 hover:underline">Delete</button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {!classes.length && <Empty>No classes yet.</Empty>}
        <form action={saveClass} className="flex flex-wrap items-center gap-2 border-t border-black/[.08] bg-stone-50 px-4 py-3">
          <input name="name" placeholder="New class, e.g. P1 B" className="input w-48 py-1.5" required />
          <div className="w-52">{teacherSelect()}</div>
          <button className="btn py-1.5">Add class</button>
        </form>
      </div>
    </>
  );
}
