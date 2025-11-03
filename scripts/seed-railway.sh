#!/bin/bash
# Script per eseguire il seed del database su Railway

echo "🌱 Esecuzione seed database su Railway..."
echo ""

# Esegui il seed direttamente su Railway
railway run npx prisma db seed --schema=prisma/schema.prisma

echo ""
echo "✅ Seed completato!"
