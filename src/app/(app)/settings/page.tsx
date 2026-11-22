import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateStr } from "@/lib/format";
import { Badge, Empty, Flash, PageHeader } from "@/components/ui";
import { createSubject, createTerm, deleteSubject, setCurrentTerm } from "../admin-actions";

export const metadata = { title: "Terms & subjects" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireUser(["ADMIN"]);
  const { msg } = await searchParams;
  const [terms, subjects] = await Promise.all([
    db.term.findMany({ orderBy: { startDate: "desc" } }),
    db.subject.findMany({ include: { _count: { select: { results: true } } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Terms & subjects" />
      <Flash message={msg} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Terms</h2>
          <ul className="divide-y divide-black/[.06]">
            {terms.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-stone-500">{dateStr(t.startDate)} – {dateStr(t.endDate)}</p>
                </div>
                {t.isCurrent ? (
                  <Badge tone="PAID">Current</Badge>
                ) : (
                  <form action={setCurrentTerm}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-xs text-brand-600 hover:underline">Make current</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {!terms.length && <Empty>No terms yet.</Empty>}
          <form action={createTerm} className="grid gap-2 border-t border-black/[.08] bg-stone-50 p-4 sm:grid-cols-4">
            <input name="name" placeholder="Term 2 2027" className="input sm:col-span-4" required />
            <label className="sm:col-span-2"><span className="label">Starts</span><input name="startDate" type="date" className="input" required /></label>
            <label className="sm:col-span-2"><span className="label">Ends</span><input name="endDate" type="date" className="input" required /></label>
            <button className="btn sm:col-span-4">Add term</button>
          </form>
        </section>

        <section className="card">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Subjects</h2>
          <ul className="divide-y divide-black/[.06]">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                <span><span className="font-medium">{s.name}</span> <span className="font-mono text-xs text-stone-400">{s.code}</span></span>
                {s._count.results === 0 ? (
                  <form action={deleteSubject}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-xs text-red-600 hover:underline">Delete</button>
                  </form>
                ) : (
                  <span className="text-xs text-stone-400">{s._count.results} scores</span>
                )}
              </li>
            ))}
          </ul>
          {!subjects.length && <Empty>No subjects yet.</Empty>}
          <form action={createSubject} className="flex flex-wrap gap-2 border-t border-black/[.08] bg-stone-50 p-4">
            <input name="name" placeholder="Subject name" className="input flex-1" required />
            <input name="code" placeholder="CODE" className="input w-24" required />
            <button className="btn">Add</button>
          </form>
        </section>
      </div>
    </>
  );
}
