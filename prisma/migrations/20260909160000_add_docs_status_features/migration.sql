-- CreateTable
CREATE TABLE `doc_articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NULL,
    `area` VARCHAR(191) NULL,
    `difficulty` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `reading_minutes` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `doc_articles_slug_key`(`slug`),
    INDEX `doc_articles_published_idx`(`published`),
    INDEX `doc_articles_area_idx`(`area`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_endpoints` (
    `id` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL DEFAULT 'GET',
    `path` VARCHAR(191) NOT NULL,
    `summary` TEXT NULL,
    `api_group` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `request_example` LONGTEXT NULL,
    `response_example` LONGTEXT NULL,
    `version` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_endpoints_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_error_codes` (
    `id` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 400,
    `code` VARCHAR(191) NOT NULL,
    `meaning` TEXT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_error_codes_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_components` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `component_group` VARCHAR(191) NULL,
    `current_status` VARCHAR(191) NOT NULL DEFAULT 'operational',
    `uptime_90d` VARCHAR(191) NULL,
    `p50_latency_ms` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `status_components_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incidents` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'minor',
    `status` VARCHAR(191) NOT NULL DEFAULT 'resolved',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,
    `body` LONGTEXT NULL,
    `updates` LONGTEXT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `incidents_slug_key`(`slug`),
    INDEX `incidents_published_idx`(`published`),
    INDEX `incidents_started_at_idx`(`started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_requests` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Under review',
    `vote_count` INTEGER NOT NULL DEFAULT 0,
    `category` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `feature_requests_slug_key`(`slug`),
    INDEX `feature_requests_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_request_votes` (
    `id` VARCHAR(191) NOT NULL,
    `request_id` VARCHAR(191) NOT NULL,
    `voter_key` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `feature_request_votes_request_id_idx`(`request_id`),
    UNIQUE INDEX `feature_request_votes_request_id_voter_key_key`(`request_id`, `voter_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `feature_request_votes` ADD CONSTRAINT `feature_request_votes_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `feature_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
