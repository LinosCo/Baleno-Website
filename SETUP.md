# Setup Guidato - Baleno Booking System

Questa guida ti accompagnerà nel setup completo del progetto in locale.

## Prerequisiti

Assicurati di avere installato:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 (`npm install -g pnpm`)
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

### Verifica installazioni

```bash
node --version    # v18.0.0 o superiore
pnpm --version    # 8.0.0 o superiore
psql --version    # 14.0 o superiore
```

## Step 1: Clone e Setup Iniziale

```bash
cd /Users/alessandroborsato/Desktop/baleno_booking_system

# Installa tutte le dipendenze
pnpm install
```

## Step 2: Setup Database PostgreSQL

### Opzione A: Database locale

1. Crea un nuovo database PostgreSQL:

```bash
# Accedi a PostgreSQL
psql -U postgres

# Crea database
CREATE DATABASE baleno_booking;

# Esci
\q
```

2. Copia il file `.env.example` e configura il DATABASE_URL:

```bash
# Per backend
cp apps/api/.env.example apps/api/.env

# Per prisma
cp prisma/.env.example prisma/.env
```

3. Modifica `apps/api/.env` e `prisma/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/baleno_booking"
```

### Opzione B: Docker PostgreSQL

```bash
# Avvia solo PostgreSQL con docker-compose
docker-compose up -d postgres

# Il database sarà disponibile su localhost:5432
```

## Step 3: Setup Variabili d'Ambiente

### Backend (`apps/api/.env`)

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/baleno_booking"

# Redis (opzionale per development)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT - IMPORTANTE: Cambia questi valori in produzione!
JWT_SECRET="your-super-secret-jwt-key-CHANGE-IN-PRODUCTION"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-CHANGE-IN-PRODUCTION"
JWT_REFRESH_EXPIRES_IN="30d"

# Stripe (Test Mode)
STRIPE_SECRET_KEY="sk_test_..." # Ottieni da https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET="whsec_..." # Configura webhook su Stripe

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password" # Usa App Password per Gmail
EMAIL_FROM="noreply@balenosanzeno.it"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# OAuth Google (opzionale)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"
```

### Frontend (`apps/web/.env`)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Chiave pubblica da Stripe

# App Info
NEXT_PUBLIC_APP_NAME="Baleno Sanzeno"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Inizializza Database

```bash
# Genera Prisma Client
pnpm --filter @baleno/api prisma:generate

# Crea le tabelle nel database
pnpm --filter @baleno/api prisma:migrate

# (Opzionale) Popola database con dati di test
pnpm --filter @baleno/prisma db:seed
```

### Credenziali Utenti Test (dopo seed)

- **Admin**: admin@balenosanzeno.it / admin123
- **Community Manager**: cm@balenosanzeno.it / cm123
- **User**: user@test.com / user123

## Step 5: Avvia l'Applicazione

### Opzione A: Avvia tutto con un comando

```bash
# Dalla root del progetto
pnpm dev
```

Questo avvierà:
- Backend API su `http://localhost:4000`
- Frontend Web su `http://localhost:3000`

### Opzione B: Avvia singolarmente

```bash
# Terminal 1 - Backend
pnpm --filter @baleno/api dev

# Terminal 2 - Frontend
pnpm --filter @baleno/web dev
```

### Opzione C: Docker Compose (tutto incluso)

```bash
# Avvia tutti i servizi (PostgreSQL, Redis, API, Web)
docker-compose up

# In background
docker-compose up -d

# Ferma tutti i servizi
docker-compose down
```

## Step 6: Verifica Installazione

1. **Backend API**: Apri http://localhost:4000/api
2. **Frontend**: Apri http://localhost:3000
3. **Prisma Studio** (GUI database): `pnpm --filter @baleno/api prisma:studio`

## Comandi Utili

### Development

```bash
# Avvia tutto in dev mode
pnpm dev

# Avvia solo backend
pnpm --filter @baleno/api dev

# Avvia solo frontend
pnpm --filter @baleno/web dev

# Prisma Studio (database GUI)
pnpm --filter @baleno/api prisma:studio
```

### Build

```bash
# Build tutto
pnpm build

# Build solo backend
pnpm --filter @baleno/api build

# Build solo frontend
pnpm --filter @baleno/web build
```

### Database

```bash
# Genera Prisma Client
pnpm --filter @baleno/api prisma:generate

# Crea migration
pnpm --filter @baleno/api prisma:migrate

# Reset database (ATTENZIONE: cancella tutti i dati!)
pnpm --filter @baleno/prisma db:reset

# Seed database
pnpm --filter @baleno/prisma db:seed

# Apri Prisma Studio
pnpm --filter @baleno/api prisma:studio
```

### Linting & Type Checking

```bash
# Lint tutto
pnpm lint

# Type check
pnpm type-check

# Format code
pnpm format
```

### Clean

```bash
# Pulisci build outputs e node_modules
pnpm clean

# Reinstalla tutto da zero
pnpm clean && pnpm install
```

## Troubleshooting

### Errore: "Port 4000 already in use"

```bash
# Trova e termina processo sulla porta 4000
lsof -ti:4000 | xargs kill -9

# Su Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Errore: "Cannot connect to database"

1. Verifica che PostgreSQL sia in esecuzione:
   ```bash
   # macOS/Linux
   pg_ctl status

   # O controlla se il servizio è attivo
   docker-compose ps postgres
   ```

2. Verifica il DATABASE_URL in `.env`

3. Testa connessione:
   ```bash
   psql -U postgres -h localhost -p 5432 -d baleno_booking
   ```

### Errore Prisma: "Migration failed"

```bash
# Reset database e ricrea da zero
pnpm --filter @baleno/prisma db:reset

# Poi rigenera client
pnpm --filter @baleno/api prisma:generate
```

### Errore: "Module not found @baleno/..."

```bash
# Reinstalla dipendenze
pnpm install

# Rigenera Prisma Client
pnpm --filter @baleno/api prisma:generate
```

## Next Steps

Dopo il setup, consulta:

1. **[README.md](./README.md)** - Panoramica generale del progetto
2. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guide di sviluppo
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide di deployment

## Supporto

Per problemi o domande, apri una issue su GitHub o contatta il team di sviluppo.
