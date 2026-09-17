-- CreateTable
CREATE TABLE `security_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'global',
    `turnstileEnabled` BOOLEAN NOT NULL DEFAULT false,
    `turnstileSiteKey` TEXT NULL,
    `turnstileSecretKey` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
