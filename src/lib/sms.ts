import "server-only";

/**
 * Sends an SMS through Africa's Talking when AT_USERNAME and AT_API_KEY are set.
 * Without them it only logs, so the app works in development with no SMS account.
 * Use AT_USERNAME="sandbox" to test against their sandbox.
 */
export async function sendSms(phones: string[], text: string): Promise<{ sent: number; mode: "live" | "log" }> {
  const to = [...new Set(phones.map((p) => p.replace(/\s+/g, "")).filter(Boolean))];
  if (!to.length) return { sent: 0, mode: "log" };

  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  if (!username || !apiKey) {
    console.log(`[sms:log] to ${to.length} numbers: ${text}`);
    return { sent: to.length, mode: "log" };
  }

  const host = username === "sandbox" ? "api.sandbox.africastalking.com" : "api.africastalking.com";
  const body = new URLSearchParams({ username, to: to.join(","), message: text });
  if (process.env.AT_SENDER_ID) body.set("from", process.env.AT_SENDER_ID);
  const res = await fetch(`https://${host}/version1/messaging`, {
    method: "POST",
    headers: { apiKey, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`SMS provider returned ${res.status}`);
  return { sent: to.length, mode: "live" };
}
