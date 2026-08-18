-- CreateTable
CREATE TABLE `home_sections` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL,
    `site_name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `default_seo_title` VARCHAR(191) NULL,
    `default_seo_description` TEXT NULL,
    `theme` LONGTEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pages` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `eyebrow` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` TEXT NULL,
    `og_image_url` VARCHAR(191) NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pages_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_items` (
    `id` VARCHAR(191) NOT NULL,
    `collection` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `title` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `body` LONGTEXT NULL,
    `icon` VARCHAR(191) NULL,
    `tone` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `link_url` VARCHAR(191) NULL,
    `link_label` VARCHAR(191) NULL,
    `data` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
