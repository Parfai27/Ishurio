"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Role } from "@prisma/client";
import {
  BookOpenCheck, CalendarCheck, LayoutDashboard, Menu, MessageSquareText, Settings2, ShieldCheck, Users, Wallet, X, School,
  type LucideIcon,
} from "lucide-react";

const ITEMS: { href: string; label: string; icon: LucideIcon; roles: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "ACCOUNTANT", "PARENT"] },
  { href: "/students", label: "Students", icon: Users, roles: ["ADMIN", "TEACHER", "ACCOUNTANT"] },
  { href: "/classes", label: "Classes", icon: School, roles: ["ADMIN"] },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ["ADMIN", "TEACHER"] },
  { href: "/results", label: "Results", icon: BookOpenCheck, roles: ["ADMIN", "TEACHER"] },
  { href: "/fees", label: "Fees", icon: Wallet, roles: ["ADMIN", "ACCOUNTANT"] },
  { href: "/messages", label: "Messages", icon: MessageSquareText, roles: ["ADMIN", "TEACHER", "ACCOUNTANT", "PARENT"] },
  { href: "/users", label: "Users", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/settings", label: "Terms & subjects", icon: Settings2, roles: ["ADMIN"] },
];

function Links({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <ul className="grid gap-0.5">
      {ITEMS.filter((i) => i.roles.includes(role)).map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition ${
                active ? "bg-white font-medium text-ink shadow-[0_1px_2px_rgb(0_0_0/.06)] ring-1 ring-black/[.06]" : "text-stone-600 hover:bg-black/[.04] hover:text-ink"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-brand-600" : "text-stone-400 group-hover:text-stone-600"}`} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop: the list in the sidebar. Phone and tablet: a menu button that opens the same list. */
export function Nav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="hidden lg:block" aria-label="Main">
        <Links role={role} />
      </nav>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-black/[.1] bg-white lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="absolute inset-x-0 top-full z-20 border-b border-black/[.08] bg-paper p-4 shadow-lg lg:hidden">
          <Links role={role} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </>
  );
}
