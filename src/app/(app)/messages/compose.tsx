"use client";

import { useActionState, useState } from "react";
import { sendMessage } from "./actions";

export function Compose({ classes, canMessageAll }: { classes: { id: string; name: string }[]; canMessageAll: boolean }) {
  const [state, action, pending] = useActionState(sendMessage, null);
  const v = (name: string) => state?.values[name] ?? "";
  const [audience, setAudience] = useState(canMessageAll ? "ALL_PARENTS" : "CLASS");
  return (
    <form key={JSON.stringify(state?.values ?? null)} action={action} className="space-y-3 p-4">
      <div>
        <label className="label" htmlFor="m-aud">Send to</label>
        <select id="m-aud" name="audience" className="input" value={audience} onChange={(e) => setAudience(e.target.value)}>
          {canMessageAll && <option value="ALL_PARENTS">All parents</option>}
          <option value="CLASS">Parents of one class</option>
          <option value="STAFF">Staff</option>
        </select>
      </div>
      {audience === "CLASS" && (
        <div>
          <label className="label" htmlFor="m-class">Class</label>
          <select id="m-class" name="classId" className="input" required defaultValue={v("classId")}>
            <option value="" disabled>Choose</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="m-title">Title</label>
        <input id="m-title" name="title" defaultValue={v("title")} className="input" required maxLength={120} />
      </div>
      <div>
        <label className="label" htmlFor="m-body">Message</label>
        <textarea id="m-body" name="body" defaultValue={v("body")} className="input min-h-28" required maxLength={2000} />
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" name="sms" defaultChecked={!!v("sms")} className="accent-brand-600" /> Also send as SMS
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn w-full" disabled={pending}>{pending ? "Sending…" : "Send"}</button>
    </form>
  );
}
