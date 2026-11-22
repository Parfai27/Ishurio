import { CircleAlert, Receipt, Wallet } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fullName, money } from "@/lib/format";
import { currentTerm, invoiceStatus, invoiceTotals } from "@/lib/queries";
import { Badge, Empty, Flash, PageHeader, Stat } from "@/components/ui";
import { BillClassForm } from "./forms";

export const metadata = { title: "Fees" };

export default async function FeesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser(["ADMIN", "ACCOUNTANT"]);
  const sp = await searchParams;
  const cur = await currentTerm();
  const termId = sp.term ?? cur?.id;
  const [classes, terms, invoices] = await Promise.all([
    db.classRoom.findMany({ orderBy: { name: "asc" } }),
    db.term.findMany({ orderBy: { startDate: "desc" } }),
    db.invoice.findMany({
      where: { termId, ...(sp.class ? { student: { classId: sp.class } } : {}) },
      include: { payments: true, student: { include: { classRoom: true, parent: true } } },
      orderBy: [{ student: { classRoom: { name: "asc" } } }, { student: { lastName: "asc" } }],
    }),
  ]);
  const shown = sp.status === "owing" ? invoices.filter((i) => invoiceStatus(i) !== "PAID") : invoices;
  const totals = invoiceTotals(invoices);

  return (
    <>
      <PageHeader title="Fees" subtitle={terms.find((t) => t.id === termId)?.name} />
      <Flash message={sp.msg} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={Receipt} label="Billed" value={money(totals.billed)} />
        <Stat icon={Wallet} label="Collected" value={money(totals.paid)} hint={totals.billed ? `${Math.round((totals.paid / totals.billed) * 100)}%` : undefined} />
        <Stat icon={CircleAlert} label="Outstanding" value={money(totals.balance)} hint={`${invoices.filter((i) => invoiceStatus(i) !== "PAID").length} invoices not fully paid`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="min-w-0 xl:col-span-3">
          <form className="mb-4 flex flex-wrap gap-2">
            <select name="term" defaultValue={termId} className="input max-w-[12rem]">
              {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select name="class" defaultValue={sp.class ?? ""} className="input max-w-[10rem]">
              <option value="">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[10rem]">
              <option value="">All invoices</option>
              <option value="owing">Still owing</option>
            </select>
            <button className="btn-ghost">Filter</button>
          </form>
          <div className="card overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Student</th><th>Item</th><th className="text-right">Amount</th><th className="text-right">Balance</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {shown.map((inv) => {
                  const t = invoiceTotals([inv]);
                  return (
                    <tr key={inv.id}>
                      <td>
                        <Link href={`/students/${inv.studentId}`} className="font-medium hover:underline">{fullName(inv.student)}</Link>
                        <span className="block text-xs text-stone-500">{inv.student.classRoom.name}{inv.student.parent?.phone ? ` · ${inv.student.parent.phone}` : ""}</span>
                      </td>
                      <td className="text-stone-600">{inv.description}</td>
                      <td className="text-right tabular-nums">{money(inv.amount)}</td>
                      <td className="text-right tabular-nums">{money(t.balance)}</td>
                      <td><Badge>{invoiceStatus(inv)}</Badge></td>
                      <td className="text-right">
                        {t.balance > 0 && <Link href={`/fees/invoice/${inv.id}`} className="text-xs font-medium text-brand-600 hover:underline">Record payment</Link>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!shown.length && <Empty>No invoices here. Bill a class to get started.</Empty>}
          </div>
        </div>
        <aside className="card h-fit">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Bill a class</h2>
          {terms.length ? <BillClassForm classes={classes} terms={terms} termId={termId} /> : <Empty>Add a term first.</Empty>}
        </aside>
      </div>
    </>
  );
}
