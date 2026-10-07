/*
  Warnings:

  - You are about to drop the `mail_template_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mail_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `mail_templates` DROP FOREIGN KEY `mail_templates_categoryId_fkey`;

-- DropTable
DROP TABLE `mail_template_categories`;

-- DropTable
DROP TABLE `mail_templates`;
