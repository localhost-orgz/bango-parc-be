-- CreateTable
CREATE TABLE "reservation_reschedule_histories" (
    "id" SERIAL NOT NULL,
    "reservationId" INTEGER NOT NULL,
    "oldStartDateTime" TIMESTAMP(3) NOT NULL,
    "oldEndDateTime" TIMESTAMP(3) NOT NULL,
    "newStartDateTime" TIMESTAMP(3) NOT NULL,
    "newEndDateTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_reschedule_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reservation_reschedule_histories" ADD CONSTRAINT "reservation_reschedule_histories_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
