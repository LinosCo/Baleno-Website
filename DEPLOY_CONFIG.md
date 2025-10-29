# 🚀 CONFIGURAZIONE DEPLOY - PRONTO PER COPY/PASTE

## ⚡ QUICK START (3 passi)

### PASSO 1: Railway (Backend + Database)

1. Vai su https://railway.app e crea account (usa GitHub login)
2. Click "New Project" → "Deploy from GitHub repo" → Seleziona questo repository
3. In Settings:
   - Root Directory: `apps/api`
4. Aggiungi servizio PostgreSQL: Click "+ New" → "Database" → "PostgreSQL"
5. Vai in "Variables" e **COPIA/INCOLLA TUTTO QUESTO** ⬇️

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=AQ0n9dvYqlh3HHEphje0hXwGzYd2l3mr7WATvsh5KaQ=
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=+pu1k8kPWpUmn+WkinKF4E259t4zdnd6D+LzvmA7qxw=
JWT_REFRESH_EXPIRES_IN=30d
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@balenosanzeno.it
FRONTEND_URL=https://temporary.com
```

📝 **DA MODIFICARE:**
- `SMTP_USER`: La tua email Gmail
- `SMTP_PASSWORD`: [Vai qui per generarla](https://myaccount.google.com/apppasswords)
- `STRIPE_SECRET_KEY`: Dalla tua dashboard Stripe (opzionale per ora)
- `FRONTEND_URL`: Lo aggiorneremo dopo con l'URL Vercel

6. Click "Deploy" e aspetta 2-3 minuti
7. **COPIA L'URL** che Railway ti dà (es: https://xxx.railway.app)

---

### PASSO 2: Vercel (Frontend)

1. Vai su https://vercel.com e crea account (usa GitHub login)
2. Click "Add New..." → "Project" → Importa questo repository
3. Configurazione:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
4. In "Environment Variables" **COPIA/INCOLLA TUTTO QUESTO** ⬇️

```env
NEXT_PUBLIC_API_URL=[INCOLLA-QUI-URL-RAILWAY]/api
NEXT_PUBLIC_APP_NAME=Baleno Sanzeno
NEXT_PUBLIC_APP_URL=https://temporary.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

📝 **DA MODIFICARE:**
- `NEXT_PUBLIC_API_URL`: Sostituisci con l'URL Railway che hai copiato prima + `/api`
- `NEXT_PUBLIC_APP_URL`: Lo aggiorneremo dopo

5. Click "Deploy" e aspetta 2-3 minuti
6. **COPIA L'URL** che Vercel ti dà (es: https://xxx.vercel.app)

---

### PASSO 3: Aggiorna URL Incrociati

#### Su Railway:
- Vai in Variables
- Modifica `FRONTEND_URL` con l'URL Vercel che hai copiato
- Railway farà redeploy automaticamente

#### Su Vercel:
- Vai in Settings → Environment Variables
- Modifica `NEXT_PUBLIC_APP_URL` con il tuo URL Vercel
- Click "Redeploy"

---

## 🗄️ Database Migrations (Dopo il primo deploy)

Installa Railway CLI e run migrations:

```bash
npm install -g @railway/cli
railway login
railway link
railway run pnpm --filter @baleno/api prisma:migrate:deploy
railway run pnpm --filter @baleno/api prisma:seed
```

---

## 💳 Stripe Webhook (Opzionale, quando vuoi pagamenti veri)

1. Vai su https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `[TUO-URL-RAILWAY]/api/payments/webhook`
4. Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copia il "Signing secret"
6. Su Railway → Variables → Modifica `STRIPE_WEBHOOK_SECRET`

---

## ✅ TEST

Apri questi URL per verificare:

1. **Backend Health**: `[TUO-URL-RAILWAY]/api/health` → Dovresti vedere `{"status":"ok"}`
2. **Frontend**: `[TUO-URL-VERCEL]` → Dovresti vedere la homepage con logo Baleno

---

## 🎉 HAI FINITO!

La tua app è LIVE su internet!

**Problemi?** Controlla i logs:
- Railway: Dashboard → Service → Logs
- Vercel: Dashboard → Project → Deployments → View Function Logs

---

## 📧 Come ottenere Gmail App Password

1. Abilita 2FA su Google: https://myaccount.google.com/security
2. Vai su: https://myaccount.google.com/apppasswords
3. Seleziona "Mail" e "Other" come dispositivo
4. Copia la password generata (16 caratteri)
5. Usa questa come `SMTP_PASSWORD`

---

## 🔐 Segreti Generati (NON CONDIVIDERE!)

Questi segreti sono già nei config sopra:

- JWT_SECRET: `AQ0n9dvYqlh3HHEphje0hXwGzYd2l3mr7WATvsh5KaQ=`
- JWT_REFRESH_SECRET: `+pu1k8kPWpUmn+WkinKF4E259t4zdnd6D+LzvmA7qxw=`

**⚠️ IMPORTANTE**: Questi sono forti e sicuri. NON cambiarli o perderai le sessioni utente!

---

## 📱 Dominio Custom (Opzionale)

### Su Vercel:
1. Settings → Domains
2. Aggiungi `balenosanzeno.it`
3. Configura i DNS secondo le istruzioni Vercel

### Su Railway:
1. Settings → Domains
2. Aggiungi `api.balenosanzeno.it`
3. Configura i DNS secondo le istruzioni Railway

---

Tempo totale stimato: **10-15 minuti** ⏱️
