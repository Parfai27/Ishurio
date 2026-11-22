import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateStr, fullName, money } from "@/lib/format";
import { invoiceTotals } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { PaymentForm } from "../../forms";

export const metadata = { title: "Record payment" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "ACCOUNTANT"]);
  const { id } = await params;
  const inv = await db.invoice.findUnique({
    where: { id },
    include: { payments: { orderBy: { paidAt: "desc" } }, student: { include: { classRoom: true } }, term: true },
  });
  if (!inv) notFound();
  const t = invoiceTotals([inv]);

  return (
    <>
      <PageHeader title="Record payment" subtitle={`${fullName(inv.student)} · ${inv.student.classRoom.name} · ${inv.description} · ${inv.term.name}`} />
      <div className="card mb-6 grid gap-4 p-5 text-sm sm:grid-cols-3">
        <div><p className="text-xs text-stone-500">Invoice</p><p className="font-semibold">{money(inv.amount)}</p></div>
        <div><p className="text-xs text-stone-500">Paid</p><p className="font-semibold">{money(t.paid)}</p></div>
        <div><p className="text-xs text-stone-500">Balance</p><p className="font-semibold">{money(t.balance)}</p></div>
      </div>
      {t.balance > 0 ? <div className="card p-5"><PaymentForm invoiceId={inv.id} balance={t.balance} /></div> : <p className="text-sm text-emerald-700">This invoice is fully paid.</p>}
      {!!inv.payments.length && (
        <section className="card mt-6">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">Previous payments</h2>
          <table className="table">
            <tbody>
              {inv.payments.map((p) => (
                <tr key={p.id}>
                  <td>{dateStr(p.paidAt)}</td>
                  <td className="tabular-nums">{money(p.amount)}</td>
                  <td className="text-stone-600">{p.method.replace("_", " ").toLowerCase()}{p.reference ? ` · ${p.reference}` : ""}</td>
                  <td className="text-right"><Link href={`/fees/receipt/${p.id}`} className="text-xs text-brand-600 hover:underline">Receipt</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
