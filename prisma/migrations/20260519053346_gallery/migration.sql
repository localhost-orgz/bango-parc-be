-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'TOUR360');

-- CreateTable
CREATE TABLE "galleries" (
    "id" SERIAL NOT NULL,
    "areaId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
