import path from "node:path";
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(path.resolve(process.cwd(), "../../.env"));
  } catch (error) {
    const isMissingEnvFile =
      error instanceof Error && "code" in error && error.code === "ENOENT";

    if (!isMissingEnvFile) {
      throw error;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Set it in the environment or root .env file.",
  );
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
