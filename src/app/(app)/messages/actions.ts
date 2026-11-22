"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, type FormState } from "@/lib/form-state";
import { SCHOOL_NAME } from "@/lib/format";
import { sendSms } from "@/lib/sms";

const MessageInput = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Message is required").max(2000),
  audience: z.enum(["ALL_PARENTS", "CLASS", "STAFF"]),
  classId: z.string().optional(),
  sms: z.string().optional(),
});

export async function sendMessage(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "TEACHER", "ACCOUNTANT"]);
  const parsed = MessageInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message, form);
  const { title, body, audience, classId, sms } = parsed.data;
  if (audience === "CLASS" && !classId) return fail("Choose a class.", form);
  if (audience === "ALL_PARENTS" && user.role === "TEACHER") return fail("Teachers can message their class or staff. Ask an admin for school-wide notices.", form);

  await db.message.create({
    data: { title, body, audience, classId: audience === "CLASS" ? classId : null, senderId: user.userId },
  });

  let note = "Message posted.";
  if (sms) {
    const recipients =
      audience === "STAFF"
        ? await db.user.findMany({ where: { role: { not: "PARENT" } }, select: { phone: true } })
        : await db.user.findMany({
            where: { role: "PARENT", children: { some: audience === "CLASS" ? { classId } : {} } },
            select: { phone: true },
          });
    const phones = recipients.map((r) => r.phone).filter((p): p is string => !!p);
    try {
      const r = await sendSms(phones, `${SCHOOL_NAME}: ${title}. ${body}`.slice(0, 459));
      note = r.mode === "live" ? `Message posted and sent by SMS to ${r.sent} numbers.` : `Message posted. SMS is not configured, so ${r.sent} texts were only logged.`;
    } catch (e) {
      note = `Message posted, but SMS failed: ${(e as Error).message}`;
    }
  }

  revalidatePath("/messages");
  revalidatePath("/dashboard");
  redirect(`/messages?msg=${encodeURIComponent(note)}`);
}
