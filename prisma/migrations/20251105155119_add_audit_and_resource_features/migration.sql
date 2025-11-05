-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('MEETING_ROOM', 'COWORKING', 'EVENT_SPACE', 'EQUIPMENT', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'CANCEL', 'LOGIN', 'LOGOUT', 'ROLE_CHANGE');

-- AlterTable
ALTER TABLE "resources" ADD COLUMN "category" "ResourceCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN "minBookingHours" INTEGER DEFAULT 1,
ADD COLUMN "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "maintenanceStart" TIMESTAMP(3),
ADD COLUMN "maintenanceEnd" TIMESTAMP(3),
ADD COLUMN "maintenanceReason" TEXT,
ADD COLUMN "features" TEXT[],
ADD COLUMN "tags" TEXT[],
ADD COLUMN "restrictions" TEXT,
ADD COLUMN "wheelchairAccessible" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userRole" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resources_category_idx" ON "resources"("category");

-- CreateIndex
CREATE INDEX "resources_maintenanceMode_idx" ON "resources"("maintenanceMode");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
