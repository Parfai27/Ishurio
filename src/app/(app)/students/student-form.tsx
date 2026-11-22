"use client";

import { useActionState } from "react";
import { saveStudent } from "./actions";

type Props = {
  classes: { id: string; name: string }[];
  student?: {
    id: string;
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string | null;
    classId: string;
    parent: { name: string; email: string; phone: string | null } | null;
  };
  suggestedAdmissionNo?: string;
};

export function StudentForm({ classes, student, suggestedAdmissionNo }: Props) {
  const [state, action, pending] = useActionState(saveStudent, null);
  // After a failed save, show what was typed rather than the original values.
  const v = (name: string, fallback?: string | null) => state?.values[name] ?? fallback ?? "";
  return (
    <form key={JSON.stringify(state?.values ?? null)} action={action} className="card space-y-6 p-6">
      {student && <input type="hidden" name="id" value={student.id} />}
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold">Student</legend>
        <Field label="Admission number" name="admissionNo" defaultValue={v("admissionNo", student?.admissionNo ?? suggestedAdmissionNo)} required />
        <div>
          <label className="label" htmlFor="classId">Class</label>
          <select id="classId" name="classId" className="input" defaultValue={v("classId", student?.classId)} required>
            <option value="" disabled>Choose a class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Field label="First name" name="firstName" defaultValue={v("firstName", student?.firstName)} required />
        <Field label="Last name" name="lastName" defaultValue={v("lastName", student?.lastName)} required />
        <div>
          <label className="label" htmlFor="gender">Gender</label>
          <select id="gender" name="gender" className="input" defaultValue={v("gender", student?.gender ?? "FEMALE")}>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
          </select>
        </div>
        <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={v("dateOfBirth", student?.dateOfBirth)} />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-1 text-sm font-semibold">Parent or guardian</legend>
        <p className="-mt-1 mb-2 text-xs text-stone-500 sm:col-span-3">
          Optional. If the email is new, a parent account is created so they can log in to the parent portal.
        </p>
        <Field label="Name" name="parentName" defaultValue={v("parentName", student?.parent?.name)} />
        <Field label="Email" name="parentEmail" type="email" defaultValue={v("parentEmail", student?.parent?.email)} />
        <Field label="Phone" name="parentPhone" defaultValue={v("parentPhone", student?.parent?.phone)} placeholder="+250 7…" />
      </fieldset>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Saving…" : student ? "Save changes" : "Add student"}</button>
    </form>
  );
}

function Field({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="input" {...rest} />
    </div>
  );
}
