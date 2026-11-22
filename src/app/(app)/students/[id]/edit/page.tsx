import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fullName } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { StudentForm } from "../../student-form";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const [student, classes] = await Promise.all([
    db.student.findUnique({ where: { id }, include: { parent: true } }),
    db.classRoom.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!student) notFound();
  return (
    <>
      <PageHeader title={`Edit ${fullName(student)}`} />
      <StudentForm
        classes={classes}
        student={{
          ...student,
          dateOfBirth: student.dateOfBirth?.toISOString().slice(0, 10) ?? null,
          parent: student.parent && { name: student.parent.name, email: student.parent.email, phone: student.parent.phone },
        }}
      />
    </>
  );
}
