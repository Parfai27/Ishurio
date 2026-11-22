"use client";

import { useActionState } from "react";
import { billClass, recordPayment } from "./actions";

type Opt = { id: string; name: string };

export function BillClassForm({ classes, terms, termId }: { classes: Opt[]; terms: Opt[]; termId?: string }) {
  const [state, action, pending] = useActionState(billClass, null);
  const v = (name: string, fallback?: string) => state?.values[name] ?? fallback ?? "";
  return (
    <form key={JSON.stringify(state?.values ?? null)} action={action} className="space-y-3 p-4">
      <div>
        <label className="label" htmlFor="b-class">Class</label>
        <select id="b-class" name="classId" className="input" required defaultValue={v("classId")}>
          <option value="" disabled>Choose</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="b-term">Term</label>
        <select id="b-term" name="termId" className="input" defaultValue={v("termId", termId)}>
          {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="b-desc">Description</label>
        <input id="b-desc" name="description" defaultValue={v("description")} className="input" placeholder="Tuition, Lunch, Uniform…" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="b-amount">Amount per student</label>
          <input id="b-amount" name="amount" type="number" min={1} defaultValue={v("amount")} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="b-due">Due date</label>
          <input id="b-due" name="dueDate" type="date" defaultValue={v("dueDate")} className="input" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn w-full" disabled={pending}>{pending ? "Creating…" : "Bill every student in class"}</button>
    </form>
  );
}

export function PaymentForm({ invoiceId, balance }: { invoiceId: string; balance: number }) {
  const [state, action, pending] = useActionState(recordPayment, null);
  const v = (name: string, fallback?: string) => state?.values[name] ?? fallback ?? "";
  return (
    <form key={JSON.stringify(state?.values ?? null)} action={action} className="space-y-3">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="p-amount">Amount</label>
          <input id="p-amount" name="amount" type="number" min={1} max={balance} defaultValue={v("amount", String(balance))} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="p-method">Method</label>
          <select id="p-method" name="method" className="input" defaultValue={v("method", "MOBILE_MONEY")}>
            <option value="MOBILE_MONEY">Mobile money</option>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="p-ref">Reference</label>
          <input id="p-ref" name="reference" defaultValue={v("reference")} className="input" placeholder="Transaction ID" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Saving…" : "Record payment and print receipt"}</button>
    </form>
  );
}
