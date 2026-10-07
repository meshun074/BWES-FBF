import path from "node:path";

import { createPrismaClient } from "../src/client";

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

const prisma = createPrismaClient({ databaseUrl });

interface ReferenceSeed {
  canonicalKey: string;
  name: string;
  description?: string;
}

interface HierarchicalReferenceSeed extends ReferenceSeed {
  parentCanonicalKey?: string;
}

const resourceTypes: HierarchicalReferenceSeed[] = [
  {
    canonicalKey: "fbf_resource",
    name: "FBF Resource",
    description:
      "Top-level managed resource concept for the BWES Knowledge Hub.",
  },
  {
    canonicalKey: "knowledge_information_resource",
    name: "Knowledge / Information Resource",
    parentCanonicalKey: "fbf_resource",
  },
  {
    canonicalKey: "research_publication",
    name: "Research / Publication",
    parentCanonicalKey: "knowledge_information_resource",
  },
  {
    canonicalKey: "dataset_quantitative_resource",
    name: "Dataset / Quantitative Resource",
    parentCanonicalKey: "knowledge_information_resource",
  },
  {
    canonicalKey: "lived_experience",
    name: "Lived Experience",
    parentCanonicalKey: "knowledge_information_resource",
  },
  {
    canonicalKey: "blog_news_editorial_content",
    name: "Blog / News / Editorial Content",
    parentCanonicalKey: "knowledge_information_resource",
  },
  {
    canonicalKey: "program_service",
    name: "Program / Service",
    parentCanonicalKey: "fbf_resource",
  },
  {
    canonicalKey: "opportunity",
    name: "Opportunity",
    parentCanonicalKey: "fbf_resource",
  },
  {
    canonicalKey: "employment_opportunity",
    name: "Employment Opportunity",
    parentCanonicalKey: "opportunity",
  },
  {
    canonicalKey: "networking_opportunity",
    name: "Networking Opportunity",
    parentCanonicalKey: "opportunity",
  },
  {
    canonicalKey: "mentorship_opportunity",
    name: "Mentorship Opportunity",
    parentCanonicalKey: "opportunity",
  },
  {
    canonicalKey: "volunteer_opportunity",
    name: "Volunteer Opportunity",
    parentCanonicalKey: "opportunity",
  },
];

const contentFormats: ReferenceSeed[] = [
  {
    canonicalKey: "dataset_dashboard",
    name: "Dataset / Dashboard",
  },
  {
    canonicalKey: "mobility_index_data",
    name: "Mobility Index Data",
  },
  {
    canonicalKey: "research_report",
    name: "Research Report",
  },
  {
    canonicalKey: "academic_publication",
    name: "Academic Publication",
  },
  {
    canonicalKey: "policy_brief",
    name: "Policy Brief",
  },
  {
    canonicalKey: "discussion_paper",
    name: "Discussion Paper",
  },
  {
    canonicalKey: "literature_review",
    name: "Literature Review",
  },
  {
    canonicalKey: "infographic",
    name: "Infographic",
  },
  {
    canonicalKey: "toolkit",
    name: "Toolkit",
  },
  {
    canonicalKey: "community_story",
    name: "Community Story",
  },
  {
    canonicalKey: "event_workshop_webinar",
    name: "Event / Workshop / Webinar",
  },
  {
    canonicalKey: "opportunity",
    name: "Opportunity",
  },
];

const topics: ReferenceSeed[] = [
  {
    canonicalKey: "employment",
    name: "Employment",
  },
  {
    canonicalKey: "income",
    name: "Income",
  },
  {
    canonicalKey: "entrepreneurship",
    name: "Entrepreneurship",
  },
  {
    canonicalKey: "education",
    name: "Education",
  },
  {
    canonicalKey: "leadership",
    name: "Leadership",
  },
  {
    canonicalKey: "housing",
    name: "Housing",
  },
  {
    canonicalKey: "financial_security",
    name: "Financial Security",
  },
  {
    canonicalKey: "immigration",
    name: "Immigration",
  },
  {
    canonicalKey: "health_wellbeing",
    name: "Health & Wellbeing",
  },
  {
    canonicalKey: "caregiving",
    name: "Caregiving",
  },
  {
    canonicalKey: "workplace_equity",
    name: "Workplace Equity",
  },
];

const audiences: ReferenceSeed[] = [
  {
    canonicalKey: "community",
    name: "Community",
  },
  {
    canonicalKey: "researcher",
    name: "Researcher",
  },
  {
    canonicalKey: "policymaker",
    name: "Policymaker",
  },
  {
    canonicalKey: "student",
    name: "Student",
  },
  {
    canonicalKey: "employer",
    name: "Employer",
  },
  {
    canonicalKey: "journalist",
    name: "Journalist",
  },
  {
    canonicalKey: "funder",
    name: "Funder",
  },
  {
    canonicalKey: "educator",
    name: "Educator",
  },
];

const populations: ReferenceSeed[] = [
  {
    canonicalKey: "black_women",
    name: "Black Women",
  },
  {
    canonicalKey: "immigrants",
    name: "Immigrants",
  },
  {
    canonicalKey: "students",
    name: "Students",
  },
  {
    canonicalKey: "newcomers",
    name: "Newcomers",
  },
];

const geographies: ReferenceSeed[] = [
  {
    canonicalKey: "canada",
    name: "Canada",
  },
];

async function seedResourceTypes(): Promise<void> {
  const idsByCanonicalKey = new Map<string, string>();

  for (const entry of resourceTypes) {
    let parentId: string | null = null;

    if (entry.parentCanonicalKey) {
      parentId =
        idsByCanonicalKey.get(entry.parentCanonicalKey) ??
        (
          await prisma.resourceType.findUnique({
            where: {
              canonicalKey: entry.parentCanonicalKey,
            },
            select: {
              id: true,
            },
          })
        )?.id ??
        null;

      if (!parentId) {
        throw new Error(
          `Missing ResourceType parent: ${entry.parentCanonicalKey}`,
        );
      }
    }

    const existing = await prisma.resourceType.findUnique({
      where: {
        canonicalKey: entry.canonicalKey,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      idsByCanonicalKey.set(entry.canonicalKey, existing.id);
      continue;
    }

    const created = await prisma.resourceType.create({
      data: {
        canonicalKey: entry.canonicalKey,
        name: entry.name,
        description: entry.description,
        parentId,
      },
      select: {
        id: true,
      },
    });

    idsByCanonicalKey.set(entry.canonicalKey, created.id);
  }
}

async function seedContentFormats(): Promise<void> {
  for (const entry of contentFormats) {
    const existing = await prisma.contentFormat.findUnique({
      where: {
        canonicalKey: entry.canonicalKey,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      await prisma.contentFormat.create({
        data: entry,
      });
    }
  }
}

async function seedTopics(): Promise<void> {
  for (const entry of topics) {
    const existing = await prisma.topic.findUnique({
      where: {
        canonicalKey: entry.canonicalKey,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      await prisma.topic.create({
        data: entry,
      });
    }
  }
}

async function seedAudiences(): Promise<void> {
  for (const entry of audiences) {
    const existing = await prisma.audience.findUnique({
      where: {
        canonicalKey: entry.canonicalKey,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      await prisma.audience.create({
        data: entry,
      });
    }
  }
}

async function seedPopulations(): Promise<void> {
  for (const entry of populations) {
    const existing = await prisma.population.findUnique({
      where: {
        canonicalKey: entry.canonicalKey,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      await prisma.population.create({
        data: entry,
      });
    }
  }
}

async function seedGeographies(): Promise<void> {
  for (const entry of geographies) {
    const existing = await prisma.geography.findUnique({
      where: {
        canonicalKey: entry.canonicalKey,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      await prisma.geography.create({
        data: entry,
      });
    }
  }
}

async function main(): Promise<void> {
  console.log("Seeding BWES canonical reference data...");

  await seedResourceTypes();
  await seedContentFormats();
  await seedTopics();
  await seedAudiences();
  await seedPopulations();
  await seedGeographies();

  console.log("BWES canonical reference data seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error("BWES database seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
