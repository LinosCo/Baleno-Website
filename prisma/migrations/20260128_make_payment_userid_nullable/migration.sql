-- AlterTable
-- Make userId nullable in Payment table for manual bookings

-- First, drop the foreign key constraint
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_userId_fkey";

-- Make userId nullable
ALTER TABLE "payments" ALTER COLUMN "userId" DROP NOT NULL;

-- Re-add the foreign key constraint with nullable relationship
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
