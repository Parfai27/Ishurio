import Link from "next/link";
import { Logo } from "@/components/logo";

const PAGES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-black/[.08] bg-paper">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" aria-label="Ishurio home"><Logo /></Link>
          <nav aria-label="Legal" className="flex gap-1 text-sm">
            {PAGES.map((p) => (
              <Link key={p.href} href={p.href} className="rounded-lg px-3 py-2 text-stone-600 transition hover:bg-black/[.04] hover:text-ink">
                {p.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 md:py-14">
        <article className="legal">{children}</article>
      </main>
      <footer className="mx-auto max-w-3xl px-5 pb-10 text-[13px] text-stone-500">
        © 2026 Ishurio · <Link href="/login" className="hover:text-ink">Sign in</Link>
      </footer>
    </div>
  );
}
