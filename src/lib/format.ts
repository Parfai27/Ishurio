export const SCHOOL_NAME = process.env.SCHOOL_NAME ?? "My School";
export const CURRENCY = process.env.SCHOOL_CURRENCY ?? "RWF";

export function money(amount: number) {
  return `${CURRENCY} ${amount.toLocaleString("en-US")}`;
}

export function dateStr(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Today as a YYYY-MM-DD string (UTC), used for date inputs and @db.Date columns. */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function grade(score: number) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
}

export function fullName(s: { firstName: string; lastName: string }) {
  return `${s.firstName} ${s.lastName}`;
}
