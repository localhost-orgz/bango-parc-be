/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_verificationToken_key" ON "customers"("verificationToken");
