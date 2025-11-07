-- CreateTable
CREATE TABLE "booking_resources" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_resources_bookingId_idx" ON "booking_resources"("bookingId");

-- CreateIndex
CREATE INDEX "booking_resources_resourceId_idx" ON "booking_resources"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_resources_bookingId_resourceId_key" ON "booking_resources"("bookingId", "resourceId");

-- AddForeignKey
ALTER TABLE "booking_resources" ADD CONSTRAINT "booking_resources_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_resources" ADD CONSTRAINT "booking_resources_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
