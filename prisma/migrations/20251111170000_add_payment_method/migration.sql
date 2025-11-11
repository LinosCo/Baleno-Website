-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'OTHER');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CREDIT_CARD';
