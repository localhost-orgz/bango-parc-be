-- CreateTable
CREATE TABLE "reservation_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "durationIntervalHour" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_types_pkey" PRIMARY KEY ("id")
);
