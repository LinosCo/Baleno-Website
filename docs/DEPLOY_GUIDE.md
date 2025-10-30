# 🚀 Guida Deploy Baleno Booking System

## Overview
- **Backend API**: Railway (con PostgreSQL database)
- **Frontend**: Vercel
- **Repository**: https://github.com/LinosCo/Baleno-Website.git

---

## 📦 STEP 1: Deploy Backend su Railway

### 1.1 Crea Account e Progetto

1. Vai su https://railway.app
2. Fai login con GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Seleziona: `LinosCo/Baleno-Website`
5. Railway rileverà automaticamente il `railway.json`

### 1.2 Aggiungi Database PostgreSQL

1. Nel tuo progetto Railway, click "+ New"
2. Seleziona "Database" → "Add PostgreSQL"
3. Railway creerà automaticamente il database

### 1.3 Configura Variabili d'Ambiente

Nel pannello Railway del tuo backend service, vai su "Variables" e aggiungi:

```bash
# Database (Automatico da Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (GENERA NUOVI!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# App Config
NODE_ENV=production
PORT=4000

# Frontend URL (Lo aggiornerai dopo deploy Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Email (Opzionale per ora)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (Opzionale per ora)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth (Opzionale per ora)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-api.railway.app/api/auth/google/callback
```

### 1.4 Deploy e Migrazioni

1. Railway farà il build automaticamente
2. Dopo il primo deploy, vai su "Deployments" e clicca sul deployment
3. Apri la "Terminal" e esegui le migrazioni:

```bash
cd apps/api && pnpm prisma:migrate:deploy
```

4. **IMPORTANTE**: Esegui il seed per popolare il database con i dati iniziali:

```bash
cd apps/api && pnpm prisma:seed
```

### 1.5 Genera Domain

1. Vai su "Settings" del service
2. Nella sezione "Networking" → "Public Networking"
3. Click "Generate Domain"
4. **Copia l'URL** (es: `https://baleno-api.railway.app`)

---

## 🌐 STEP 2: Deploy Frontend su Vercel

### 2.1 Setup Vercel

1. Vai su https://vercel.com
2. Login con GitHub
3. Click "Add New..." → "Project"
4. Importa: `LinosCo/Baleno-Website`

### 2.2 Configurazione Build

Vercel dovrebbe rilevare automaticamente Next.js. Verifica:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm install && pnpm --filter @baleno/web build`
- **Output Directory**: `.next` (default)
- **Install Command**: `pnpm install`

### 2.3 Variabili d'Ambiente

Nel dashboard Vercel, vai su "Settings" → "Environment Variables":

```bash
# Backend API URL (Dall'URL Railway che hai copiato)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api

# Stripe (Opzionale)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2.4 Deploy

1. Click "Deploy"
2. Aspetta il completamento (2-3 minuti)
3. **Copia il domain Vercel** (es: `https://baleno-booking.vercel.app`)

---

## 🔗 STEP 3: Collega Frontend e Backend

### 3.1 Aggiorna CORS nel Backend

Torna su Railway, nel service backend:

1. Vai su "Variables"
2. Aggiungi/Aggiorna:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

3. Il backend si riavvierà automaticamente

### 3.2 Verifica CORS nel Codice

Il file `apps/api/src/main.ts` dovrebbe già avere:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

---

## ✅ STEP 4: Test della Piattaforma

### 4.1 Test Backend

Apri: `https://your-backend.railway.app/api`

Dovresti vedere:
```json
{
  "message": "Baleno Booking System API",
  "version": "1.0.0",
  "status": "running"
}
```

### 4.2 Test Frontend

1. Apri: `https://your-app.vercel.app`
2. Prova la registrazione con un nuovo account
3. Test login con account seed:
   - **Admin**: `admin@baleno.com` / `Admin123!`
   - **Manager**: `manager@baleno.com` / `Manager123!`
   - **User**: `user@baleno.com` / `User123!`

### 4.3 Checklist Funzionalità

- [ ] Homepage si carica correttamente
- [ ] Registrazione nuovo utente funziona
- [ ] Login funziona
- [ ] Dashboard utente si carica
- [ ] Lista risorse disponibili
- [ ] Creazione nuova prenotazione
- [ ] Area admin accessibile (con account admin)

---

## 🔧 Troubleshooting

### Errore: "Cannot connect to database"

1. Verifica che `DATABASE_URL` sia impostato correttamente in Railway
2. Controlla che il database PostgreSQL sia attivo
3. Riesegui le migrazioni: `pnpm prisma:migrate:deploy`

### Errore: "Network Error" nel frontend

1. Verifica che `NEXT_PUBLIC_API_URL` in Vercel punti all'URL Railway corretto
2. Controlla che `FRONTEND_URL` in Railway punti all'URL Vercel corretto
3. Rideploy del frontend se hai cambiato le env vars

### Database vuoto / Nessuna risorsa

Esegui il seed nel terminal Railway:
```bash
cd apps/api && pnpm prisma:seed
```

---

## 📝 Credenziali di Test (dopo seed)

### Utenti:
- **Admin**: `admin@baleno.com` / `Admin123!`
- **Community Manager**: `manager@baleno.com` / `Manager123!`
- **User**: `user@baleno.com` / `User123!`

### Risorse precaricate:
- 9 risorse reali dal REGOLAMENTO BALENO
- Sala Riunioni, Spazi Coworking, Attrezzature, etc.

---

## 🎨 URL Finali

Dopo il deploy avrai:

- **Frontend**: https://baleno-booking.vercel.app (o custom domain)
- **Backend API**: https://baleno-api.railway.app (o custom domain)
- **Admin Panel**: https://baleno-booking.vercel.app/admin

---

## 💡 Note Importanti

1. **Railway Free Tier**: $5/mese di crediti gratuiti, sufficiente per demo
2. **Vercel Free Tier**: Illimitato per progetti personali
3. **Database**: PostgreSQL su Railway con backup automatici
4. **HTTPS**: Automatico su entrambe le piattaforme
5. **Custom Domains**: Configurabili su entrambe le piattaforme

---

## 🚀 Pronto per la Demo!

Dopo questi step, la piattaforma sarà live e accessibile da qualsiasi dispositivo!

Condividi l'URL Vercel con il cliente per la demo. 🎉

---

**Sviluppato da Lino's & Co**
