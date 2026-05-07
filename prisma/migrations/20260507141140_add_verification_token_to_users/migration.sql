-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "verificationToken" TEXT;
