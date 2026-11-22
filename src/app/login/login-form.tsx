"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-5" noValidate={false}>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            id="email" name="email" type="email" required autoComplete="email" autoFocus
            defaultValue={state?.values.email ?? ""}
            aria-invalid={state ? true : undefined}
            aria-describedby={state ? "login-error" : undefined}
            className="input h-11 pl-10"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            id="password" name="password" type={show ? "text" : "password"} required autoComplete="current-password"
            aria-invalid={state ? true : undefined}
            aria-describedby={state ? "login-error" : undefined}
            className="input h-11 pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
          >
            {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {state?.error && (
        <p id="login-error" role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button className="btn group h-11 w-full text-[15px]" disabled={pending}>
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…</>
        ) : (
          <>Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" /></>
        )}
      </button>
    </form>
  );
}
