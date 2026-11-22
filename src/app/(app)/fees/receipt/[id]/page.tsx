import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SCHOOL_NAME, dateStr, fullName, money } from "@/lib/format";
import { invoiceTotals } from "@/lib/queries";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Receipt" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "ACCOUNTANT"]);
  const { id } = await params;
  const p = await db.payment.findUnique({
    where: { id },
    include: { recordedBy: true, invoice: { include: { payments: true, term: true, student: { include: { classRoom: true } } } } },
  });
  if (!p) notFound();
  const { balance } = invoiceTotals([p.invoice]);
  const s = p.invoice.student;

  return (
    <div className="mx-auto max-w-md">
      <div className="no-print mb-4 flex justify-between">
        <Link href="/fees" className="btn-ghost">Back to fees</Link>
        <PrintButton label="Print receipt" />
      </div>
      <article className="card p-6 text-sm">
        <header className="mb-4 border-b border-dashed border-stone-300 pb-4 text-center">
          <h1 className="text-lg font-semibold">{SCHOOL_NAME}</h1>
          <p className="text-stone-500">Payment receipt</p>
          <p className="mt-1 font-mono text-xs text-stone-400">No. {p.id.slice(-8).toUpperCase()}</p>
        </header>
        <dl className="space-y-2">
          {[
            ["Date", dateStr(p.paidAt)],
            ["Student", `${fullName(s)} (${s.admissionNo})`],
            ["Class", s.classRoom.name],
            ["For", `${p.invoice.description} · ${p.invoice.term.name}`],
            ["Method", p.method.replace("_", " ").toLowerCase()],
            ["Reference", p.reference ?? "—"],
            ["Received by", p.recordedBy.name],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><dt className="text-stone-500">{k}</dt><dd className="text-right">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-4 flex justify-between border-t border-dashed border-stone-300 pt-4 text-base font-semibold">
          <span>Amount paid</span><span>{money(p.amount)}</span>
        </div>
        <div className="mt-1 flex justify-between text-stone-500"><span>Balance remaining</span><span>{money(balance)}</span></div>
      </article>
    </div>
  );
}
