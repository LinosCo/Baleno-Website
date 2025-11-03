#!/bin/bash
# Script per deployare il backend su Railway

set -e

echo "🚂 Baleno Website - Railway Deploy Script"
echo "=========================================="
echo ""

# Verifica autenticazione Railway
echo "Verifico autenticazione Railway..."
if ! railway whoami &>/dev/null; then
    echo "❌ Non sei autenticato su Railway"
    echo "   Esegui: railway login"
    exit 1
fi

echo "✅ Autenticato su Railway"
echo ""

# Verifica se il progetto è collegato
echo "Verifico collegamento al progetto..."
if ! railway status &>/dev/null; then
    echo "⚠️  Progetto non collegato"
    echo ""
    echo "Per collegare il progetto:"
    echo "1. Vai su https://railway.app"
    echo "2. Crea un nuovo progetto o seleziona 'Baleno-Website'"
    echo "3. Connetti il repository GitHub: LinosCo/Baleno-Website"
    echo "4. Torna qui ed esegui: railway link"
    echo ""
    exit 1
fi

echo "✅ Progetto collegato"
echo ""

# Deploy
echo "🚀 Avvio deploy..."
railway up

echo ""
echo "✅ Deploy completato!"
echo ""
echo "Per verificare lo stato:"
echo "  railway status"
echo ""
echo "Per vedere i logs:"
echo "  railway logs"
echo ""
echo "Per eseguire il seed del database:"
echo "  railway run pnpm --filter @baleno/api prisma:seed"
