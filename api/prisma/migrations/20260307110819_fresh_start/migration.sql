/*
  Warnings:

  - You are about to drop the column `is_two_factor_auth_enabled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_two_factor_auth_enabled",
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;
