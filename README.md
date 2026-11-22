# Ishurio

School management software for schools in Rwanda.

A web app for running a school's attendance, results and report cards, fees and receipts, and parent messaging (in the app and by SMS).

Built with Next.js 15 (App Router, server actions), Prisma 6, PostgreSQL and Tailwind CSS 4.

## Who can do what

| Role | Access |
| --- | --- |
| Admin | Everything: students, classes, users, terms and subjects, attendance, results, fees, messages |
| Teacher | Attendance and results for any class, and messages to a class or to staff |
| Bursar (accountant) | Fees: bill classes, record payments, print receipts, plus messages |
| Parent | Their own children's attendance, results, report cards, fee balance, and school notices |

## Setup

1. Create a database (for example `sms`) in your local Postgres.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` and `DIRECT_URL` to your Postgres connection string (the same value locally), and `AUTH_SECRET` to a long random string.
3. Run:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000.

### Demo accounts (after seeding)

Every demo account uses the password `demo1234`, which is set in `prisma/seed.ts`.

- `admin@school.test`: administrator
- `teacher@school.test`: teacher (P4 A)
- `bursar@school.test`: bursar
- `parent@school.test`: parent of one P4 A student

Running `npm run db:seed` again **wipes all data** and reloads the demo data.

## SMS

Messages can also be sent as SMS through [Africa's Talking](https://africastalking.com). Set these in `.env`:

```
AT_USERNAME="sandbox"       # or your live username
AT_API_KEY="..."
AT_SENDER_ID=""             # optional approved sender ID
```

Without them, SMS sends are written to the server log only.

## Deploy (Vercel + Neon)

1. **Database:** create a project on [Neon](https://neon.tech). From its connection details, copy the **pooled** connection string and the **direct** (unpooled) one.
2. **App:** on [Vercel](https://vercel.com), choose *Add New → Project* and import this GitHub repository. Before deploying, add these environment variables:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon's pooled connection string |
   | `DIRECT_URL` | Neon's direct connection string |
   | `AUTH_SECRET` | a long random string, e.g. from `openssl rand -base64 32` |
   | `SCHOOL_NAME` | the school's name |
   | `SCHOOL_CURRENCY` | `RWF` |

3. Deploy. The build runs `prisma migrate deploy`, so the tables are created on the first deploy.
4. **Demo data (optional):** from your machine, point the seed at Neon once. This **wipes** the database first.

```bash
DATABASE_URL="<pooled url>" DIRECT_URL="<direct url>" npm run db:seed
```

Every push to `main` deploys again.

## Before selling this to a school

- Change every demo password, and set a strong `AUTH_SECRET`.
- Set `SCHOOL_NAME` and `SCHOOL_CURRENCY` in `.env`. Each school currently needs its own deployment and database.
- Set up daily database backups.
