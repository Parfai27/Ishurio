import type { ReactNode } from "react";
import { CheckCircle2, Inbox, type LucideIcon } from "lucide-react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-medium leading-tight md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-stone-500">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-stone-500">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-nowrap text-[22px] font-medium leading-none tracking-tight tabular-nums xl:text-[26px]">{value}</p>
      {hint && <p className="mt-2 text-[13px] text-stone-500">{hint}</p>}
    </div>
  );
}

const BADGE: Record<string, string> = {
  PRESENT: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  LATE: "bg-amber-50 text-amber-800 ring-amber-600/20",
  ABSENT: "bg-red-50 text-red-700 ring-red-600/15",
  EXCUSED: "bg-sky-50 text-sky-800 ring-sky-600/15",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  PARTIAL: "bg-amber-50 text-amber-800 ring-amber-600/20",
  UNPAID: "bg-red-50 text-red-700 ring-red-600/15",
};
const BADGE_LABEL: Record<string, string> = { PRESENT: "Present", LATE: "Late", ABSENT: "Absent", EXCUSED: "Excused", PAID: "Paid", PARTIAL: "Part paid", UNPAID: "Unpaid" };

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const key = tone ?? String(children);
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium ring-1 ring-inset ${BADGE[key] ?? "bg-stone-100 text-stone-700 ring-black/[.06]"}`}>
      {typeof children === "string" && BADGE_LABEL[children] ? BADGE_LABEL[children] : children}
    </span>
  );
}

export function Empty({ children, icon: Icon = Inbox }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-stone-500">
      <Icon className="h-6 w-6 text-stone-300" aria-hidden="true" />
      {children}
    </div>
  );
}

export function Flash({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="status" className="mb-6 flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
      <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
      {message}
    </div>
  );
}

/** A card section with a title row (optionally an icon and an action on the right). */
export function Panel({ title, icon: Icon, action, children, className = "" }: { title: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-black/[.06] px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-[15px] font-medium tracking-normal">
          {Icon && <Icon className="h-4 w-4 text-stone-400" aria-hidden="true" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
