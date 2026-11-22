import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, FileText, MessageSquareText, Wallet } from "lucide-react";
import { Logo } from "@/components/logo";
import { SCHOOL_NAME } from "@/lib/format";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

const ROLES = [
  { icon: CalendarCheck, label: "Teachers", text: "Take the register and enter marks" },
  { icon: Wallet, label: "Bursar", text: "Bill classes and print receipts" },
  { icon: FileText, label: "Parents", text: "See marks, attendance and balances" },
  { icon: MessageSquareText, label: "Head teacher", text: "Send notices and manage the school" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="flex flex-col px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Ishurio home"><Logo /></Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the website
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-black/[.08] bg-white px-3 py-1 text-[13px] text-stone-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {SCHOOL_NAME}
          </p>
          <h1 className="text-[34px] font-medium leading-tight">Sign in to Ishurio</h1>
          <p className="mt-2 text-[15px] text-stone-600">Staff and parents use the same sign-in. Your school gives you your email and password.</p>
          <LoginForm />
          <p className="mt-8 text-[13px] text-stone-500">
            Forgot your password? Ask your school&apos;s administrator to set a new one.
          </p>
        </div>

        <p className="text-[13px] text-stone-400">© 2026 Ishurio</p>
      </section>

      <aside className="relative hidden overflow-hidden bg-sky lg:block" aria-label="What each login can do">
        <Image
          src="/assets/img/photo-f26709565.webp"
          alt="A teacher helps primary pupils in blue-checked uniforms working on green laptops at wooden desks"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-x-8 bottom-8 rounded-2xl bg-white p-6 shadow-[0_24px_48px_-24px_rgb(0_0_0/.45)]">
          <p className="text-[13px] font-medium text-stone-500">One app, four logins</p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {ROLES.map(({ icon: Icon, label, text }) => (
              <li key={label} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-[13px] leading-snug text-stone-600">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
