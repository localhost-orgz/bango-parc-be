-- CreateTable
CREATE TABLE "area_types" (
    "id" SERIAL NOT NULL,
    "areaName" TEXT NOT NULL,
    "maxCapPax" INTEGER NOT NULL,
    "electricPowerWatt" INTEGER NOT NULL,
    "isWeddingAvailable" BOOLEAN NOT NULL,

    CONSTRAINT "area_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_price_plans" (
    "id" SERIAL NOT NULL,
    "areaTypeId" INTEGER NOT NULL,
    "planName" TEXT NOT NULL,
    "planDuration" INTEGER NOT NULL,
    "planPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "area_price_plans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "area_price_plans" ADD CONSTRAINT "area_price_plans_areaTypeId_fkey" FOREIGN KEY ("areaTypeId") REFERENCES "area_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
