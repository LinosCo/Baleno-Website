#!/bin/bash
# Script per deployare il frontend su Vercel

set -e

echo "▲ Baleno Website - Vercel Deploy Script"
echo "========================================"
echo ""

# Verifica autenticazione Vercel
echo "Verifico autenticazione Vercel..."
if ! vercel whoami &>/dev/null; then
    echo "❌ Non sei autenticato su Vercel"
    echo "   Esegui: vercel login"
    exit 1
fi

echo "✅ Autenticato su Vercel"
echo ""

# Deploy
echo "🚀 Avvio deploy su Vercel..."
cd apps/web
vercel --prod

echo ""
echo "✅ Deploy completato!"
echo ""
echo "Il frontend è ora disponibile su Vercel"
echo ""
echo "Per configurare le variabili d'ambiente:"
echo "  vercel env add NEXT_PUBLIC_API_URL"
echo ""
echo "URL API Railway: https://baleno-website-production.up.railway.app/api"
