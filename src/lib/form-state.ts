/**
 * Result of a form server action. React 19 resets a form after its action runs,
 * so on error we send the submitted values back and the form re-renders with them.
 */
export type FormState = { error: string; values: Record<string, string> } | null;

export function fail(error: string, form: FormData): FormState {
  const values: Record<string, string> = {};
  for (const [k, v] of form) if (typeof v === "string") values[k] = v;
  return { error, values };
}
