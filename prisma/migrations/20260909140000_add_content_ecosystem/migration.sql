-- AlterTable: add created/updated timestamps to content_items (backfill existing rows to now)
ALTER TABLE `content_items`
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `content_items_collection_idx` ON `content_items`(`collection`);
CREATE INDEX `content_items_collection_published_idx` ON `content_items`(`collection`, `published`);

-- CreateTable
CREATE TABLE `builder_drafts` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `data` LONGTEXT NOT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `builder_drafts_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
