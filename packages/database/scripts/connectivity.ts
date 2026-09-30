import { createPrismaClient } from "../src";

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const prisma = createPrismaClient({ databaseUrl });

  try {
    const result = await prisma.$queryRaw<Array<{ database: string }>>`
      SELECT current_database() AS database
    `;

    console.log(`Connected to PostgreSQL database: ${result[0]?.database}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
