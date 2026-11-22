import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateStr } from "@/lib/format";
import { messagesForParent } from "@/lib/queries";
import { Badge, Empty, Flash, PageHeader } from "@/components/ui";
import { Compose } from "./compose";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const { msg } = await searchParams;
  const isParent = user.role === "PARENT";

  const [messages, classes] = await Promise.all([
    isParent
      ? messagesForParent(user.userId)
      : db.message.findMany({ include: { sender: true, classRoom: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    isParent ? [] : db.classRoom.findMany({ orderBy: { name: "asc" } }),
  ]);

  const list = (
    <div className="card">
      <ul className="divide-y divide-black/[.06]">
        {messages.map((m) => (
          <li key={m.id} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{m.title}</p>
              <Badge tone="x">{m.classRoom?.name ?? (m.audience === "STAFF" ? "Staff" : "All parents")}</Badge>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{m.body}</p>
            <p className="mt-2 text-xs text-stone-400">{m.sender.name} · {dateStr(m.createdAt)}</p>
          </li>
        ))}
      </ul>
      {!messages.length && <Empty>No messages yet.</Empty>}
    </div>
  );

  return (
    <>
      <PageHeader title="Messages" subtitle={isParent ? "Notices from the school" : "Notices to parents and staff, with optional SMS"} />
      <Flash message={msg} />
      {isParent ? (
        list
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">{list}</div>
          <aside className="card h-fit">
            <h2 className="border-b border-black/[.06] px-5 py-3.5 text-[15px] font-medium tracking-normal">New message</h2>
            <Compose classes={classes} canMessageAll={user.role !== "TEACHER"} />
          </aside>
        </div>
      )}
    </>
  );
}
