-- CreateEnum
CREATE TYPE "GalleryMediaType" AS ENUM ('PHOTO', 'TOUR360');

-- CreateTable
CREATE TABLE "galleries" (
    "id" SERIAL NOT NULL,
    "areaTypeId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "mediaType" "GalleryMediaType" NOT NULL DEFAULT 'PHOTO',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_areaTypeId_fkey" FOREIGN KEY ("areaTypeId") REFERENCES "area_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
