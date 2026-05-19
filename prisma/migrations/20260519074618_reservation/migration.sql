-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('WAITING_DP', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "reservationTypeId" INTEGER NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "totalAreaPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAddonPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remainingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "ReservationStatus" NOT NULL DEFAULT 'WAITING_DP',
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_reservations" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "priceSnapshot" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_reservations" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "addonId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "priceSnapshot" DECIMAL(15,2) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addon_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservations_uuid_key" ON "reservations"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_bookingCode_key" ON "reservations"("bookingCode");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_reservationTypeId_fkey" FOREIGN KEY ("reservationTypeId") REFERENCES "reservation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_reservations" ADD CONSTRAINT "area_reservations_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_reservations" ADD CONSTRAINT "area_reservations_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_reservations" ADD CONSTRAINT "addon_reservations_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_reservations" ADD CONSTRAINT "addon_reservations_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
