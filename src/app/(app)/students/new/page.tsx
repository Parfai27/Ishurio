import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { StudentForm } from "../student-form";

export const metadata = { title: "Add student" };

export default async function NewStudentPage() {
  await requireUser(["ADMIN"]);
  const [classes, count] = await Promise.all([db.classRoom.findMany({ orderBy: { name: "asc" } }), db.student.count()]);
  return (
    <>
      <PageHeader title="Add student" />
      {classes.length ? (
        <StudentForm classes={classes} suggestedAdmissionNo={`ADM${String(count + 1).padStart(4, "0")}`} />
      ) : (
        <p className="text-sm text-stone-600">Create a class first on the Classes page.</p>
      )}
    </>
  );
}
