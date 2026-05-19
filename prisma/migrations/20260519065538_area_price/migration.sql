-- CreateTable
CREATE TABLE "area_prices" (
    "id" SERIAL NOT NULL,
    "areaId" INTEGER NOT NULL,
    "reservationTypeId" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "area_prices_areaId_reservationTypeId_key" ON "area_prices"("areaId", "reservationTypeId");

-- AddForeignKey
ALTER TABLE "area_prices" ADD CONSTRAINT "area_prices_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_prices" ADD CONSTRAINT "area_prices_reservationTypeId_fkey" FOREIGN KEY ("reservationTypeId") REFERENCES "reservation_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
