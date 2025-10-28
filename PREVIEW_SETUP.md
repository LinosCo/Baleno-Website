# Setup Preview Online - Guida Rapida

Il codice è ora su GitHub: https://github.com/LinosCo/Baleno-Website

Per vedere una preview online, seguiremo questi step:
1. Deploy **Backend** su Railway (GRATIS)
2. Deploy **Frontend** su Vercel (GRATIS)

---

## 🚀 Step 1: Deploy Backend su Railway (5 minuti)

### 1.1 Crea account e progetto

1. Vai su [railway.app](https://railway.app)
2. Clicca "Start a New Project"
3. Scegli "Deploy from GitHub repo"
4. Autorizza Railway ad accedere a GitHub
5. Seleziona il repository `LinosCo/Baleno-Website`

### 1.2 Aggiungi PostgreSQL Database

1. Nel progetto Railway, clicca "+ New"
2. Seleziona "Database" → "PostgreSQL"
3. Railway creerà automaticamente il database

### 1.3 Configura Backend Service

1. Clicca "+ New" → "GitHub Repo" → Seleziona il tuo repo
2. Configurazione:
   - **Root Directory**: `apps/api`
   - **Build Command**:
     ```bash
     pnpm install && pnpm --filter @baleno/api prisma:generate && pnpm --filter @baleno/api build
     ```
   - **Start Command**:
     ```bash
     cd apps/api && node dist/main.js
     ```

### 1.4 Aggiungi Variabili d'Ambiente

Nel backend service, vai su "Variables" e aggiungi:

```env
# Railway fornisce automaticamente DATABASE_URL se colleghi il Postgres
# Altrimenti copialo dal servizio Postgres

NODE_ENV=production
PORT=4000

# JWT - Genera secrets forti!
JWT_SECRET=your-super-strong-secret-change-this-123456789
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-strong-refresh-secret-987654321
JWT_REFRESH_EXPIRES_IN=30d

# Stripe (test mode per ora)
STRIPE_SECRET_KEY=sk_test_51...
# Ottieni da: https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...
# Configurerai dopo il webhook

# Email - Gmail esempio (usa App Password!)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuaemail@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=noreply@balenosanzeno.it

# Frontend URL (aggiornerai dopo deploy Vercel)
FRONTEND_URL=https://baleno-sanzeno.vercel.app

# OAuth Google (opzionale, può essere lasciato vuoto per ora)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

### 1.5 Collega Database al Backend

1. Nel backend service, vai su "Settings" → "Service Variables"
2. Clicca "Connect to Database"
3. Seleziona il Postgres service
4. Railway aggiungerà automaticamente `DATABASE_URL`

### 1.6 Run Database Migrations

Una volta deployato, vai nel backend service:

1. Clicca su "..." → "Settings" → "Deployments"
2. Apri l'ultimo deployment
3. Clicca su "View Logs"
4. Una volta pronto, vai su "..." → "Run Command"
5. Esegui:
   ```bash
   pnpm --filter @baleno/api prisma:migrate:prod
   ```
6. Poi esegui il seed (opzionale, per dati test):
   ```bash
   pnpm --filter @baleno/api db:seed
   ```

### 1.7 Ottieni URL Backend

1. Nel backend service, vai su "Settings" → "Public Networking"
2. Clicca "Generate Domain"
3. Copia l'URL (es: `baleno-api-production.up.railway.app`)

**✅ Backend online!** Testa: `https://your-api-domain.railway.app/api`

---

## 🎨 Step 2: Deploy Frontend su Vercel (3 minuti)

### 2.1 Crea account e importa progetto

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "Add New..." → "Project"
3. Importa il repository GitHub `LinosCo/Baleno-Website`

### 2.2 Configura Build Settings

Vercel dovrebbe rilevare automaticamente Next.js, ma configura:

```
Framework Preset: Next.js
Root Directory: apps/web
Build Command: cd ../.. && pnpm install && pnpm --filter @baleno/web build
Output Directory: apps/web/.next
Install Command: pnpm install
```

**NOTA**: Se Vercel ha problemi con il monorepo, usa questi comandi alternativi:

```
Build Command: cd apps/web && npm install && npm run build
Install Command: npm install -g pnpm && pnpm install
```

### 2.3 Aggiungi Variabili d'Ambiente

In "Environment Variables", aggiungi:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/api
# Usa l'URL del backend da Railway

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Ottieni da: https://dashboard.stripe.com/test/apikeys

NEXT_PUBLIC_APP_NAME=Baleno Sanzeno
NEXT_PUBLIC_APP_URL=https://baleno-sanzeno.vercel.app
# Aggiornerai dopo il deploy
```

### 2.4 Deploy!

1. Clicca "Deploy"
2. Vercel builderà e deployerà il frontend
3. Una volta completato, copia il dominio (es: `baleno-website.vercel.app`)

### 2.5 Aggiorna FRONTEND_URL su Railway

1. Torna su Railway → Backend service → Variables
2. Aggiorna `FRONTEND_URL` con l'URL Vercel completo
3. Il backend si riavvierà automaticamente

**✅ Frontend online!** Visita il tuo sito su Vercel!

---

## 🔗 Step 3: Configura Dominio Custom (Opzionale)

### Per il Frontend (Vercel)

1. In Vercel → Project Settings → Domains
2. Aggiungi `balenosanzeno.it`
3. Configura i record DNS come indicato da Vercel

### Per il Backend (Railway)

1. In Railway → Backend service → Settings → Public Networking
2. Clicca "Custom Domain"
3. Aggiungi `api.balenosanzeno.it`
4. Configura i record DNS come indicato da Railway

---

## 🔧 Step 4: Configura Stripe Webhook (Per Pagamenti)

### 4.1 Crea Webhook su Stripe

1. Vai su [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Clicca "Add endpoint"
3. URL endpoint: `https://your-api-domain.railway.app/api/payments/webhook`
4. Seleziona eventi:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Clicca "Add endpoint"

### 4.2 Aggiungi Webhook Secret

1. Copia il "Signing secret" (inizia con `whsec_...`)
2. Torna su Railway → Backend Variables
3. Aggiungi/Aggiorna `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 📧 Step 5: Configura Email (Gmail)

### 5.1 Genera App Password

1. Vai su [Google Account Security](https://myaccount.google.com/security)
2. Abilita "2-Step Verification" se non attiva
3. Vai su "App passwords": https://myaccount.google.com/apppasswords
4. Seleziona "Mail" e "Other (Custom name)" → "Baleno Booking"
5. Genera password
6. Copia la password a 16 caratteri

### 5.2 Aggiorna Railway Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuaemail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=noreply@balenosanzeno.it
```

---

## ✅ Verifica Finale

### Test Backend

```bash
# Health check
curl https://your-api-domain.railway.app/api

# Test endpoint pubblico (se hai implementato)
curl https://your-api-domain.railway.app/api/resources
```

### Test Frontend

1. Visita `https://your-domain.vercel.app`
2. Controlla che la homepage si carichi
3. Verifica che i link funzionino

### Test Database

Nel Railway backend service:
1. Clicca "..." → "Run Command"
2. Esegui: `pnpm --filter @baleno/api prisma:studio`
3. Apri Prisma Studio per vedere i dati

---

## 🚀 Preview Pronta!

**🌐 Frontend**: https://your-domain.vercel.app
**🔧 Backend**: https://your-api-domain.railway.app/api
**📊 Database**: PostgreSQL su Railway
**📦 Repository**: https://github.com/LinosCo/Baleno-Website

---

## 🔄 Aggiornamenti Automatici

Sia Vercel che Railway sono configurati per **auto-deploy**:

- Ogni push su `main` → Deploy automatico su produzione
- Ogni push su branch → Deploy preview automatico
- Zero downtime deployments

```bash
# Fai modifiche
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel e Railway faranno deploy automaticamente!
```

---

## 💡 Tips

### Visualizza Logs

**Railway**:
- Backend service → Logs tab
- Vedi errori, query, richieste in tempo reale

**Vercel**:
- Project → Deployments → Select deployment → Logs

### Rollback

**Railway**:
- Deployments tab → Select previous deployment → "Redeploy"

**Vercel**:
- Deployments → Previous deployment → "Promote to Production"

### Free Tier Limits

**Railway** (Free Trial):
- $5 credito gratis (poi $5/mese per hobby)
- Sufficiente per progetti piccoli-medi

**Vercel** (Hobby - Gratis):
- Unlimited deployments
- Bandwidth: 100GB/mese
- Perfetto per progetti personali

---

## 🆘 Troubleshooting

### Build Fallisce su Vercel

**Errore**: "Cannot find module @baleno/types"

**Fix**: Assicurati che il Build Command includa il monorepo root:
```bash
cd ../.. && pnpm install && pnpm --filter @baleno/web build
```

### Backend non si connette al Database

**Fix**: Controlla che:
1. DATABASE_URL sia correttamente collegato
2. Migrations siano state eseguite
3. Database service sia attivo

### CORS Error dal Frontend

**Fix**: In `apps/api/src/main.ts`, assicurati che CORS includa l'URL Vercel:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-domain.vercel.app',
  ],
  credentials: true,
});
```

---

## 📞 Supporto

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: https://github.com/LinosCo/Baleno-Website/issues

---

🎉 **Congratulazioni!** Il tuo sistema di prenotazione è ora online e accessibile a tutti!
