-- CreateTable
CREATE TABLE "add_ons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "add_ons_pkey" PRIMARY KEY ("id")
);
