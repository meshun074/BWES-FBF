import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import type { Prisma } from "../generated/prisma/client";

export interface CreatePrismaClientOptions {
  databaseUrl: string;
}

export function createPrismaClient({
  databaseUrl,
}: CreatePrismaClientOptions): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  return new PrismaClient({
    adapter,
  });
}

export type DatabaseClient = ReturnType<typeof createPrismaClient>;
export type DatabaseJsonInput = Prisma.InputJsonValue;
