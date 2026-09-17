-- CreateTable
CREATE TABLE `job_postings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `employment_type` VARCHAR(191) NULL,
    `remote` BOOLEAN NOT NULL DEFAULT false,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NULL,
    `responsibilities` LONGTEXT NULL,
    `requirements` LONGTEXT NULL,
    `salary_band` VARCHAR(191) NULL,
    `apply_url` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `posted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closes_at` DATETIME(3) NULL,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `job_postings_slug_key`(`slug`),
    INDEX `job_postings_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resources` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Report',
    `format` VARCHAR(191) NULL,
    `file_url` VARCHAR(191) NULL,
    `external_url` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `gated` BOOLEAN NOT NULL DEFAULT false,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `resources_slug_key`(`slug`),
    INDEX `resources_published_idx`(`published`),
    INDEX `resources_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `press_assets` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Logo',
    `description` TEXT NULL,
    `file_url` VARCHAR(191) NULL,
    `formats` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `press_assets_slug_key`(`slug`),
    INDEX `press_assets_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_milestones` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `tag` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `company_milestones_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learning_paths` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NULL,
    `module_count` INTEGER NOT NULL DEFAULT 0,
    `duration_label` VARCHAR(191) NULL,
    `summary` TEXT NULL,
    `image_url` VARCHAR(191) NULL,
    `modules` LONGTEXT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `learning_paths_slug_key`(`slug`),
    INDEX `learning_paths_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certifications` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `requirements` TEXT NULL,
    `validity` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `certifications_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `releases` (
    `id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Feature',
    `channel` VARCHAR(191) NOT NULL DEFAULT 'stable',
    `released_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `security_until` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Current',
    `migration_notes` TEXT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `releases_slug_key`(`slug`),
    INDEX `releases_published_idx`(`published`),
    INDEX `releases_released_at_idx`(`released_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `download_artifacts` (
    `id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'CLI',
    `name` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NULL,
    `architecture` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `package_name` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `file_url` VARCHAR(191) NULL,
    `file_size` VARCHAR(191) NULL,
    `checksum` TEXT NULL,
    `signature_url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Stable',
    `release_id` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `download_artifacts_published_idx`(`published`),
    INDEX `download_artifacts_kind_idx`(`kind`),
    INDEX `download_artifacts_release_id_idx`(`release_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roadmap_items` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `phase` VARCHAR(191) NOT NULL DEFAULT 'now',
    `tag` VARCHAR(191) NULL,
    `target_label` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `roadmap_items_slug_key`(`slug`),
    INDEX `roadmap_items_published_idx`(`published`),
    INDEX `roadmap_items_phase_idx`(`phase`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `download_artifacts` ADD CONSTRAINT `download_artifacts_release_id_fkey` FOREIGN KEY (`release_id`) REFERENCES `releases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
