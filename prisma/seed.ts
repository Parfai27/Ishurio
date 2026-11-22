import { PrismaClient, AttendanceStatus, Gender, PaymentMethod, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Demo password for every seeded account. Change it before any real use.
export const DEMO_PASSWORD = "demo1234";

const firstNames = [
  ["Aline", "FEMALE"], ["Eric", "MALE"], ["Grace", "FEMALE"], ["Jean", "MALE"],
  ["Divine", "FEMALE"], ["Kevin", "MALE"], ["Sandrine", "FEMALE"], ["Patrick", "MALE"],
  ["Claudine", "FEMALE"], ["Olivier", "MALE"], ["Ange", "FEMALE"], ["David", "MALE"],
] as const;
const lastNames = ["Uwase", "Mugisha", "Niyonsaba", "Habimana", "Ingabire", "Nshuti", "Mukamana", "Iradukunda"];

async function main() {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.result.deleteMany(),
    prisma.attendanceRecord.deleteMany(),
    prisma.message.deleteMany(),
    prisma.student.deleteMany(),
    prisma.classRoom.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.term.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const mk = (name: string, email: string, role: Role, phone?: string) =>
    prisma.user.create({ data: { name, email, role, phone, passwordHash } });

  const admin = await mk("School Admin", "admin@school.test", "ADMIN");
  const teacher1 = await mk("Teacher Mutoni", "teacher@school.test", "TEACHER");
  const teacher2 = await mk("Teacher Kalisa", "kalisa@school.test", "TEACHER");
  const teacher3 = await mk("Teacher Uwera", "uwera@school.test", "TEACHER");
  await mk("Bursar Gatete", "bursar@school.test", "ACCOUNTANT");

  const classes = await Promise.all(
    [
      ["P4 A", teacher1.id],
      ["P5 A", teacher2.id],
      ["P6 A", teacher3.id],
    ].map(([name, teacherId]) => prisma.classRoom.create({ data: { name, teacherId } })),
  );

  const subjects = await Promise.all(
    [
      ["Mathematics", "MATH"],
      ["English", "ENG"],
      ["Kinyarwanda", "KIN"],
      ["Science", "SCI"],
      ["Social Studies", "SST"],
    ].map(([name, code]) => prisma.subject.create({ data: { name, code } })),
  );

  const term = await prisma.term.create({
    data: { name: "Term 1 2026", startDate: new Date("2026-09-07"), endDate: new Date("2026-12-04"), isCurrent: true },
  });

  let n = 1;
  let parentIdx = 1;
  const students = [];
  for (const cls of classes) {
    for (let i = 0; i < 8; i++) {
      const [first, gender] = firstNames[(n * 7) % firstNames.length];
      const last = lastNames[(n * 3) % lastNames.length];
      // The first parent gets a well-known login so the parent portal can be tried.
      const parent = await mk(
        `Parent of ${first} ${last}`,
        parentIdx === 1 ? "parent@school.test" : `parent${parentIdx}@school.test`,
        "PARENT",
        `+25078800${String(parentIdx).padStart(4, "0")}`,
      );
      parentIdx++;
      students.push(
        await prisma.student.create({
          data: {
            admissionNo: `ADM${String(n).padStart(4, "0")}`,
            firstName: first,
            lastName: last,
            gender: gender as Gender,
            dateOfBirth: new Date(2015 + (n % 3), n % 12, (n % 27) + 1),
            classId: cls.id,
            parentId: parent.id,
          },
        }),
      );
      n++;
    }
  }

  // Attendance for the last 10 school days.
  const statuses: AttendanceStatus[] = ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT", "PRESENT", "EXCUSED"];
  const days: Date[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  while (days.length < 10) {
    d.setUTCDate(d.getUTCDate() - 1);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) days.push(new Date(d));
  }
  await prisma.attendanceRecord.createMany({
    data: students.flatMap((s, si) =>
      days.map((date, di) => ({
        studentId: s.id,
        date,
        status: statuses[(si * 3 + di * 7) % statuses.length],
        recordedById: admin.id,
      })),
    ),
  });

  await prisma.result.createMany({
    data: students.flatMap((s, si) =>
      subjects.map((sub, ji) => ({
        studentId: s.id,
        subjectId: sub.id,
        termId: term.id,
        score: 35 + ((si * 13 + ji * 17) % 63),
      })),
    ),
  });

  for (const [si, s] of students.entries()) {
    const inv = await prisma.invoice.create({
      data: { studentId: s.id, termId: term.id, description: "Tuition - Term 1 2026", amount: 150000, dueDate: new Date("2026-09-30") },
    });
    const paid = [150000, 100000, 0, 50000][si % 4];
    if (paid > 0) {
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          amount: paid,
          method: (["MOBILE_MONEY", "CASH", "BANK"] as PaymentMethod[])[si % 3],
          reference: `REF${1000 + si}`,
          recordedById: admin.id,
        },
      });
    }
  }

  await prisma.message.createMany({
    data: [
      { title: "Welcome back to Term 1", body: "School resumes on 7 September. Please make sure fees are cleared by 30 September.", audience: "ALL_PARENTS", senderId: admin.id },
      { title: "P5 A science trip", body: "P5 A will visit the national museum next Friday. Please send a signed consent form.", audience: "CLASS", classId: classes[1].id, senderId: teacher2.id },
    ],
  });

  console.log(`Seeded ${students.length} students. Log in with admin@school.test / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
