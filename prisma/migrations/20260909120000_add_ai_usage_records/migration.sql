-- CreateTable
CREATE TABLE `ai_usage_records` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `appId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `inputTokens` INTEGER NOT NULL DEFAULT 0,
    `outputTokens` INTEGER NOT NULL DEFAULT 0,
    `totalTokens` INTEGER NOT NULL DEFAULT 0,
    `cachedTokens` INTEGER NOT NULL DEFAULT 0,
    `reasoningTokens` INTEGER NOT NULL DEFAULT 0,
    `costUsd` DOUBLE NULL,
    `costSource` VARCHAR(191) NULL,
    `latencyMs` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `errorMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ai_usage_records_jobId_key`(`jobId`),
    INDEX `ai_usage_records_provider_idx`(`provider`),
    INDEX `ai_usage_records_createdAt_idx`(`createdAt`),
    INDEX `ai_usage_records_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
