import path from "node:path";
import { defineConfig } from "prisma/config";

process.loadEnvFile(path.resolve(process.cwd(), "../../.env"));

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
