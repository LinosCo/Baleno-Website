# Guida Rapida al Deploy di Baleno Website

Questa guida ti aiuterà a deployare Baleno Website su Railway (backend) e Vercel (frontend).

## Prerequisiti

- Account Railway: https://railway.app
- Account Vercel: https://vercel.com
- Account GitHub: https://github.com (già configurato)

## 🚀 Metodo 1: Deploy Automatico da GitHub (CONSIGLIATO)

Questo è il metodo più semplice. Railway e Vercel rileveranno automaticamente i push su GitHub.

### A. Setup Railway (Backend + Database)

1. **Vai su Railway**: https://railway.app
2. **Crea nuovo progetto**:
   - Click su "New Project"
   - Seleziona "Deploy from GitHub repo"
   - Scegli il repository: `LinosCo/Baleno-Website`
3. **Aggiungi PostgreSQL**:
   - Nel progetto, click su "+ New"
   - Seleziona "Database" → "PostgreSQL"
4. **Configura il servizio backend**:
   - Railway rileverà automaticamente `railway.json`
   - Root Directory: già configurato per `apps/api`
5. **Configura variabili d'ambiente**:
   ```bash
   # Esegui questo script per vedere le variabili necessarie:
   ./scripts/setup-env.sh
   ```

   Variabili essenziali:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (riferimento al database)
   - `JWT_SECRET`: (copia dal terminale dopo aver eseguito setup-env.sh)
   - `JWT_REFRESH_SECRET`: (copia dal terminale)
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `FRONTEND_URL`: `https://baleno-website.vercel.app`

6. **Deploy**:
   - Railway deploierà automaticamente
   - Attendi il completamento del build

7. **Esegui il seed del database**:
   ```bash
   # Dal tuo terminale locale
   railway login
   railway link
   railway run pnpm --filter @baleno/api prisma:seed
   ```

8. **Copia l'URL pubblico**:
   - Es: `https://baleno-website-production.up.railway.app`

### B. Setup Vercel (Frontend)

1. **Vai su Vercel**: https://vercel.com
2. **Importa progetto**:
   - Click su "Add New..." → "Project"
   - Importa repository: `LinosCo/Baleno-Website`
3. **Configura il progetto**:
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web` (importante!)
   - Build Command: `pnpm build` (già configurato in vercel.json)
4. **Configura variabili d'ambiente**:
   - `NEXT_PUBLIC_API_URL`: `https://baleno-website-production.up.railway.app/api`
5. **Deploy**:
   - Click su "Deploy"
   - Attendi il completamento
6. **Copia l'URL pubblico**:
   - Es: `https://baleno-website.vercel.app`

7. **Aggiorna Railway**:
   - Torna su Railway
   - Aggiorna la variabile `FRONTEND_URL` con l'URL Vercel
   - Rideploy (Railway lo farà automaticamente)

## 🔧 Metodo 2: Deploy da CLI

Se preferisci usare la CLI:

### A. Railway

```bash
# Login
railway login

# Link al progetto (dopo averlo creato su railway.app)
railway link

# Deploy
./scripts/deploy-railway.sh

# Seed database
railway run pnpm --filter @baleno/api prisma:seed
```

### B. Vercel

```bash
# Login
vercel login

# Deploy in produzione
cd apps/web
vercel --prod
```

## 📋 Post-Deploy

### 1. Crea un admin

Connettiti al database Railway e esegui:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'tuo-email@esempio.com';
```

Oppure dalla CLI di Railway:

```bash
railway connect postgres
# Nel prompt PostgreSQL:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tuo-email@esempio.com';
```

### 2. Test del sistema

1. Vai su `https://baleno-website.vercel.app`
2. Registra un nuovo account
3. Verifica che le risorse siano visibili in `/resources`
4. Promuovi il tuo account ad ADMIN (vedi sopra)
5. Accedi al pannello admin: `/admin`

### 3. Configura Stripe (opzionale)

Se vuoi abilitare i pagamenti:

1. Vai su https://stripe.com
2. Ottieni le chiavi API (Secret Key e Publishable Key)
3. Aggiungi le variabili su Railway:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Aggiungi su Vercel:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Configura webhook su Stripe:
   - URL: `https://tuo-backend.railway.app/api/payments/webhook`
   - Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 🔍 Verifica Deploy

### Backend (Railway)

```bash
# Verifica health check
curl https://baleno-website-production.up.railway.app/api

# Verifica risorse
curl https://baleno-website-production.up.railway.app/api/resources
```

### Frontend (Vercel)

Visita: https://baleno-website.vercel.app

## 🆘 Troubleshooting

### Railway: "Database tables not found"

```bash
# Esegui migrazioni manualmente
railway run npx prisma migrate deploy --schema=../../prisma/schema.prisma
```

### Railway: "Build failed"

- Verifica che `railway.json` sia presente
- Controlla i logs: `railway logs`
- Verifica che tutte le variabili d'ambiente siano configurate

### Vercel: "Network error" su login

- Verifica che `NEXT_PUBLIC_API_URL` sia configurato
- Verifica che `FRONTEND_URL` su Railway sia corretto
- Controlla CORS su Railway

### Seed fallito

```bash
# Prova a eseguirlo direttamente
cd apps/api
railway run npx ts-node prisma/seed.ts
```

## 📚 Risorse

- [Documentazione Railway](https://docs.railway.app)
- [Documentazione Vercel](https://vercel.com/docs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## 📞 Supporto

Per problemi o domande:
- GitHub Issues: https://github.com/LinosCo/Baleno-Website/issues
- Email: info@balenosanzeno.it
