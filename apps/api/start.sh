#!/bin/bash
set -e

echo "Resolving failed migrations..."
npx prisma migrate resolve --rolled-back "20251107154522_add_booking_resources" --schema=../../prisma/schema.prisma || true

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=../../prisma/schema.prisma

echo "Starting application..."
node dist/main
