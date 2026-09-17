-- CreateTable
CREATE TABLE `ai_user_daily_usage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `requests` INTEGER NOT NULL DEFAULT 0,
    `inputTokens` INTEGER NOT NULL DEFAULT 0,
    `outputTokens` INTEGER NOT NULL DEFAULT 0,
    `totalTokens` INTEGER NOT NULL DEFAULT 0,
    `costUsd` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_user_daily_usage_date_idx`(`date`),
    INDEX `ai_user_daily_usage_userId_idx`(`userId`),
    UNIQUE INDEX `ai_user_daily_usage_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_provider_stats` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unavailable',
    `balance` DOUBLE NULL,
    `usage` DOUBLE NULL,
    `quota` DOUBLE NULL,
    `remaining` DOUBLE NULL,
    `requests` INTEGER NULL,
    `inputTokens` INTEGER NULL,
    `outputTokens` INTEGER NULL,
    `totalTokens` INTEGER NULL,
    `rateLimits` TEXT NULL,
    `extra` TEXT NULL,
    `raw` TEXT NULL,
    `error` TEXT NULL,
    `syncedAt` DATETIME(3) NULL,
    `headersAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ai_provider_stats_provider_key`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ai_usage_records_userId_createdAt_idx` ON `ai_usage_records`(`userId`, `createdAt`);
