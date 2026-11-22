import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { SCHOOL_NAME } from "@/lib/format";
import { Logo } from "@/components/logo";
import { Nav } from "@/components/nav";
import { logout } from "../login/actions";

const ROLE_LABEL = { ADMIN: "Administrator", TEACHER: "Teacher", ACCOUNTANT: "Bursar", PARENT: "Parent" } as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const userBlock = (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-[13px] font-medium text-white" aria-hidden="true">
        {initials(user.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-[12px] text-stone-500">{ROLE_LABEL[user.role]}</p>
      </div>
      <form action={logout}>
        <button className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-black/[.05] hover:text-ink" aria-label="Sign out" title="Sign out">
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-svh lg:flex">
      <aside className="no-print relative z-10 border-b border-black/[.08] bg-paper lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:pt-6 lg:pb-5">
          <Link href="/dashboard" className="block">
            <Logo />
            <span className="mt-0.5 hidden truncate text-[12px] text-stone-500 lg:block">{SCHOOL_NAME}</span>
          </Link>
          <div className="lg:hidden"><Nav role={user.role} /></div>
        </div>
        <div className="hidden flex-1 overflow-y-auto px-3 lg:block"><Nav role={user.role} /></div>
        <div className="hidden border-t border-black/[.08] p-4 lg:block">{userBlock}</div>
      </aside>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="no-print mb-6 rounded-xl border border-black/[.08] bg-white p-3 lg:hidden">{userBlock}</div>
        {children}
      </main>
    </div>
  );
}
