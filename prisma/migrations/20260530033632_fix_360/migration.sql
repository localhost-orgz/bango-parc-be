/*
  Warnings:

  - You are about to drop the column `mediaType` on the `galleries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "areas" ADD COLUMN     "link360" TEXT;

-- AlterTable
ALTER TABLE "galleries" DROP COLUMN "mediaType";
