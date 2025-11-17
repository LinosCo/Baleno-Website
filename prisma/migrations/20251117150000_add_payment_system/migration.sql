-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('RESOURCE_UNAVAILABLE', 'MAINTENANCE_SCHEDULED', 'EVENT_ALREADY_BOOKED', 'INSUFFICIENT_DOCUMENTATION', 'CAPACITY_EXCEEDED', 'PAYMENT_ISSUES', 'OTHER');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "bankTransferCode" TEXT,
ADD COLUMN     "bankTransferDate" TIMESTAMP(3),
ADD COLUMN     "bankTransferVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "stripeCheckoutSessionId" TEXT;

-- CreateTable
CREATE TABLE "payment_settings" (
    "id" TEXT NOT NULL,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripePublishableKey" TEXT,
    "stripeSecretKey" TEXT,
    "stripeWebhookSecret" TEXT,
    "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bankName" TEXT,
    "bankAccountHolder" TEXT,
    "bankIBAN" TEXT,
    "bankBIC" TEXT,
    "bankAddress" TEXT,
    "bankTransferNote" TEXT,
    "paymentDeadlineDays" INTEGER NOT NULL DEFAULT 2,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 22,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "invoiceStartNumber" INTEGER NOT NULL DEFAULT 1,
    "currentInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "paymentReminderHours" INTEGER NOT NULL DEFAULT 24,
    "sendReminders" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_paymentStatus_idx" ON "bookings"("paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeCheckoutSessionId_key" ON "payments"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bankTransferCode_key" ON "payments"("bankTransferCode");

-- CreateIndex
CREATE INDEX "payments_stripeCheckoutSessionId_idx" ON "payments"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "payments_bankTransferCode_idx" ON "payments"("bankTransferCode");

