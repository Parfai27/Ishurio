/**
 * Runs during the Vercel build, after migrations. Loads the demo data only when SEED_DEMO is "true"
 * AND the database has no users yet, so it never wipes a database that is already in use.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

async function main() {
  if (process.env.SEED_DEMO !== "true") {
    console.log("seed-if-empty: SEED_DEMO is not \"true\", skipping");
    return;
  }
  const db = new PrismaClient();
  try {
    const users = await db.user.count();
    if (users > 0) {
      console.log(`seed-if-empty: database already has ${users} users, skipping`);
      return;
    }
  } finally {
    await db.$disconnect();
  }
  console.log("seed-if-empty: database is empty, loading demo data");
  execSync("tsx prisma/seed.ts", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
