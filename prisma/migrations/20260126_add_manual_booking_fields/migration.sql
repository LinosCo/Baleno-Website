-- AlterTable: Make userId nullable for manual bookings
ALTER TABLE "bookings" ALTER COLUMN "userId" DROP NOT NULL;

-- Add manual booking fields
ALTER TABLE "bookings" ADD COLUMN "isManualBooking" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN "manualGuestName" TEXT;
ALTER TABLE "bookings" ADD COLUMN "manualGuestEmail" TEXT;
ALTER TABLE "bookings" ADD COLUMN "manualGuestPhone" TEXT;
ALTER TABLE "bookings" ADD COLUMN "createdByAdminId" TEXT;
