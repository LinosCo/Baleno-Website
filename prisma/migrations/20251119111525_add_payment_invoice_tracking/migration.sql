-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "paymentReceived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentReceivedAt" TIMESTAMP(3),
ADD COLUMN     "paymentReceivedBy" TEXT,
ADD COLUMN     "invoiceIssued" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoiceIssuedAt" TIMESTAMP(3),
ADD COLUMN     "invoiceIssuedBy" TEXT;
