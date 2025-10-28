# Deployment Guide

Guida completa per il deployment in produzione di Baleno Booking System.

## Opzioni di Deployment

1. **Railway** (Consigliato per backend)
2. **Vercel** (Consigliato per frontend)
3. **Docker + VPS** (Custom deployment)
4. **AWS** (Enterprise)

---

## Deployment Backend su Railway

### Step 1: Preparazione

1. Crea account su [Railway.app](https://railway.app)
2. Installa Railway CLI:

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Setup Database PostgreSQL

1. Nel dashboard Railway, crea nuovo progetto
2. Aggiungi servizio **PostgreSQL**
3. Copia il `DATABASE_URL` dalle variabili

### Step 3: Deploy Backend

#### Opzione A: Via GitHub (Consigliato)

1. Push codice su GitHub
2. In Railway, collega repository
3. Seleziona `apps/api` come root directory
4. Railway detecterà automaticamente la configurazione

#### Opzione B: Via CLI

```bash
# Dalla root del progetto
railway init
railway link

# Deploy
railway up
```

### Step 4: Configurazione Variabili

Nel dashboard Railway, aggiungi variabili d'ambiente:

```env
NODE_ENV=production
PORT=4000

# Database (automatico da Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=<genera-random-strong-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<genera-altro-secret>
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<app-password>
EMAIL_FROM=noreply@balenosanzeno.it

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.vercel.app

# OAuth (se usato)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-secret>
GOOGLE_CALLBACK_URL=https://your-api-domain.railway.app/api/auth/google/callback
```

### Step 5: Run Migrations

```bash
# Via Railway CLI
railway run pnpm --filter @baleno/api prisma:migrate:prod

# O aggiungi al build command in railway.json
```

### Step 6: Verifica Deployment

```bash
# Test API
curl https://your-api-domain.railway.app/api/health
```

---

## Deployment Frontend su Vercel

### Step 1: Preparazione

1. Crea account su [Vercel.com](https://vercel.com)
2. Installa Vercel CLI:

```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy

#### Opzione A: Via GitHub (Consigliato)

1. Push codice su GitHub
2. In Vercel, importa repository
3. Configura:
   - **Framework**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm --filter @baleno/web build`
   - **Output Directory**: `apps/web/.next`

#### Opzione B: Via CLI

```bash
cd apps/web
vercel

# Per production
vercel --prod
```

### Step 3: Configurazione Variabili

Nel dashboard Vercel, aggiungi variabili d'ambiente:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_NAME=Baleno Sanzeno
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app
```

### Step 4: Configurazione Dominio

1. In Vercel Settings → Domains
2. Aggiungi dominio custom: `balenosanzeno.it`
3. Configura DNS secondo istruzioni Vercel

---

## Deployment con Docker (VPS Custom)

### Step 1: Preparazione VPS

```bash
# Installa Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose
```

### Step 2: Configurazione

1. Copia codice sul VPS:

```bash
git clone <your-repo-url>
cd baleno_booking_system
```

2. Crea file `.env` nella root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=baleno_booking

# Backend
NODE_ENV=production
DATABASE_URL=postgresql://postgres:<password>@postgres:5432/baleno_booking
JWT_SECRET=<strong-secret>
# ... altre variabili
```

### Step 3: Deploy

```bash
# Build e avvia
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f

# Run migrations
docker-compose exec api pnpm prisma:migrate:prod

# Seed database (opzionale)
docker-compose exec api pnpm prisma:seed
```

### Step 4: Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/baleno

# Backend API
server {
    listen 80;
    server_name api.balenosanzeno.it;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name balenosanzeno.it www.balenosanzeno.it;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Attiva config
sudo ln -s /etc/nginx/sites-available/baleno /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d balenosanzeno.it -d www.balenosanzeno.it -d api.balenosanzeno.it
```

---

## Configurazione Stripe

### Webhook Setup

1. Vai su [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Crea nuovo endpoint:
   - URL: `https://your-api-domain/api/payments/webhook`
   - Eventi:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
3. Copia **Signing Secret** e aggiungi a `STRIPE_WEBHOOK_SECRET`

### Test Webhook in locale

```bash
# Installa Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook to localhost
stripe listen --forward-to localhost:4000/api/payments/webhook

# Test webhook
stripe trigger payment_intent.succeeded
```

---

## Configurazione Email

### Gmail Setup

1. Abilita 2FA su Google Account
2. Genera App Password:
   - https://myaccount.google.com/apppasswords
3. Usa App Password come `SMTP_PASSWORD`

### Alternative Email Services

- **SendGrid**: Gratuito fino a 100 email/giorno
- **Mailgun**: 5000 email/mese gratis
- **AWS SES**: Pay-as-you-go

---

## Monitoring & Logging

### Sentry (Error Tracking)

1. Crea account su [Sentry.io](https://sentry.io)
2. Crea progetto per backend e frontend
3. Installa SDK:

```bash
# Backend
pnpm --filter @baleno/api add @sentry/node

# Frontend
pnpm --filter @baleno/web add @sentry/nextjs
```

4. Configura:

```typescript
// Backend (apps/api/src/main.ts)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Frontend (apps/web/sentry.client.config.ts)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Logging

Railway e Vercel offrono logging integrato. Per custom VPS:

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f web

# Save to file
docker-compose logs api > api.log
```

---

## Backup Database

### Railway Backup

Railway esegue backup automatici. Per restore manuale:

```bash
# Export
railway run pg_dump > backup.sql

# Import
railway run psql < backup.sql
```

### Custom VPS Backup

```bash
# Cron job per backup giornaliero
# Add to crontab: crontab -e

0 2 * * * docker exec baleno-postgres pg_dump -U postgres baleno_booking | gzip > /backups/baleno_$(date +\%Y\%m\%d).sql.gz

# Keep only last 30 days
0 3 * * * find /backups -name "baleno_*.sql.gz" -mtime +30 -delete
```

---

## SSL/HTTPS

### Railway & Vercel

SSL è automatico e gratuito.

### Custom VPS

```bash
# Let's Encrypt (vedi sezione Nginx sopra)
sudo certbot --nginx -d balenosanzeno.it

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Performance Optimization

### Backend

1. **Caching**: Abilita Redis
2. **Database Connection Pooling**: Prisma configuration
3. **Compression**: Abilita gzip middleware
4. **Rate Limiting**: Già configurato con ThrottlerModule

### Frontend

1. **Image Optimization**: Usa `next/image`
2. **Code Splitting**: Automatico con Next.js
3. **CDN**: Vercel ha CDN globale integrato
4. **Caching**: Configura headers in `next.config.js`

---

## Checklist Pre-Production

- [ ] Tutte le variabili d'ambiente configurate
- [ ] Database migrations eseguite
- [ ] Stripe webhook configurato e testato
- [ ] Email SMTP funzionante
- [ ] SSL/HTTPS attivo
- [ ] Backup database configurato
- [ ] Monitoring/logging attivo
- [ ] OAuth (se usato) configurato
- [ ] Dominio custom configurato
- [ ] Test completi su staging
- [ ] Documentazione API aggiornata

---

## Troubleshooting Production

### API non risponde

```bash
# Check service status
railway logs

# O su VPS
docker-compose ps
docker-compose logs api
```

### Database connection errors

```bash
# Verifica DATABASE_URL
railway variables

# Test connection
railway run psql $DATABASE_URL
```

### Build failures

```bash
# Clear cache e rebuild
railway down
railway up --force
```

---

## Rollback

### Railway

```bash
railway rollback <deployment-id>
```

### Vercel

Nel dashboard → Deployments → Select previous → Promote to Production

### Docker

```bash
# Ferma servizio
docker-compose down

# Ritorna a commit precedente
git checkout <previous-commit>

# Rebuild e restart
docker-compose up -d --build
```

---

## Support & Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
