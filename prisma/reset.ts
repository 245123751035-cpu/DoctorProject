import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = [
    "AiSummary",
    "AuditLog",
    "Session",
    "Consultation",
    "Medication",
    "Allergy",
    "Investigation",
    "PatientMedicalCondition",
    "Patient",
    "Doctor"
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
  }
  console.log("Database reset complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
