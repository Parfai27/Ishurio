import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, Flash, PageHeader } from "@/components/ui";
import { createUser, resetPassword } from "../admin-actions";

export const metadata = { title: "Users" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ msg?: string; role?: string }> }) {
  await requireUser(["ADMIN"]);
  const { msg, role } = await searchParams;
  const users = await db.user.findMany({
    where: role === "PARENT" ? { role: "PARENT" } : { role: { not: "PARENT" } },
    include: { _count: { select: { children: true } } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader title="Users" subtitle="Staff and parent logins" />
      <Flash message={msg} />
      <div className="mb-4 flex gap-2 text-sm">
        <a href="/users" className={role === "PARENT" ? "btn-ghost" : "btn"}>Staff</a>
        <a href="/users?role=PARENT" className={role === "PARENT" ? "btn" : "btn-ghost"}>Parents</a>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card overflow-x-auto lg:col-span-2">
          <table className="table">
            <thead><tr><th>Name</th><th>Role</th><th>Set new password</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-stone-500">{u.email}{u.phone ? ` · ${u.phone}` : ""}{u.role === "PARENT" ? ` · ${u._count.children} child(ren)` : ""}</p>
                  </td>
                  <td><Badge tone="x">{u.role.toLowerCase()}</Badge></td>
                  <td>
                    <form action={resetPassword} className="flex gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <input name="password" type="password" minLength={8} placeholder="New password" className="input w-36 py-1" autoComplete="new-password" required aria-label={`New password for ${u.name}`} />
                      <button className="btn-ghost py-1 text-xs">Set</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="card h-fit">
          <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">New account</h2>
          <form action={createUser} className="space-y-3 p-4">
            <div><label className="label" htmlFor="u-name">Name</label><input id="u-name" name="name" className="input" required /></div>
            <div><label className="label" htmlFor="u-email">Email</label><input id="u-email" name="email" type="email" className="input" required /></div>
            <div><label className="label" htmlFor="u-phone">Phone</label><input id="u-phone" name="phone" className="input" /></div>
            <div>
              <label className="label" htmlFor="u-role">Role</label>
              <select id="u-role" name="role" className="input" defaultValue="TEACHER">
                <option value="TEACHER">Teacher</option>
                <option value="ACCOUNTANT">Bursar</option>
                <option value="ADMIN">Administrator</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>
            <div><label className="label" htmlFor="u-pw">Password</label><input id="u-pw" name="password" type="password" minLength={8} className="input" autoComplete="new-password" required /></div>
            <button className="btn w-full">Create account</button>
          </form>
        </aside>
      </div>
    </>
  );
}
