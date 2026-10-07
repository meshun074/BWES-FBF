-- CreateTable
CREATE TABLE "resource_types" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "resource_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_formats" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geographies" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "geographies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "populations" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "populations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audiences" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "canonical_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resource_types_canonical_key_key" ON "resource_types"("canonical_key");

-- CreateIndex
CREATE INDEX "resource_types_parent_id_idx" ON "resource_types"("parent_id");

-- CreateIndex
CREATE INDEX "resource_types_is_active_idx" ON "resource_types"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "content_formats_canonical_key_key" ON "content_formats"("canonical_key");

-- CreateIndex
CREATE INDEX "content_formats_is_active_idx" ON "content_formats"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "topics_canonical_key_key" ON "topics"("canonical_key");

-- CreateIndex
CREATE INDEX "topics_parent_id_idx" ON "topics"("parent_id");

-- CreateIndex
CREATE INDEX "topics_is_active_idx" ON "topics"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "geographies_canonical_key_key" ON "geographies"("canonical_key");

-- CreateIndex
CREATE INDEX "geographies_parent_id_idx" ON "geographies"("parent_id");

-- CreateIndex
CREATE INDEX "geographies_is_active_idx" ON "geographies"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "populations_canonical_key_key" ON "populations"("canonical_key");

-- CreateIndex
CREATE INDEX "populations_is_active_idx" ON "populations"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "audiences_canonical_key_key" ON "audiences"("canonical_key");

-- CreateIndex
CREATE INDEX "audiences_is_active_idx" ON "audiences"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_canonical_key_key" ON "sectors"("canonical_key");

-- CreateIndex
CREATE INDEX "sectors_is_active_idx" ON "sectors"("is_active");

-- AddForeignKey
ALTER TABLE "resource_types" ADD CONSTRAINT "resource_types_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "resource_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geographies" ADD CONSTRAINT "geographies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "geographies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
