# Baleno Booking System

Sistema completo di prenotazione spazi e risorse per Baleno San Zeno, con backend NestJS, frontend Next.js e pannello amministrativo in stile WordPress.

## 🎨 Branding Baleno

Il sistema utilizza l'identità visiva ufficiale di Baleno Sanzeno:
- **Logo**: BALENO-LOGO-BIANCO.png (logo bianco su sfondi scuri)
- **Colori**:
  - Primary (Blu Baleno): #2B548E
  - Accent (Giallo Baleno): #EDBB00
  - Secondary (Blu Chiaro): #1863DC
- **Font**: Work Sans (sostituisce Inter) - pesi 400, 500, 600, 700
- **Riferimento**: Design basato su [balenosanzeno.it](https://balenosanzeno.it)

## 📋 Caratteristiche

### Backend (NestJS + Prisma + PostgreSQL)
- **Autenticazione**: JWT con refresh tokens, OAuth Google
- **Gestione Utenti**: 3 ruoli (ADMIN, COMMUNITY_MANAGER, USER)
- **Sistema Prenotazioni**: Workflow completo con moderazione
- **Gestione Risorse**: CRUD completo per spazi, sale, attrezzature
- **Sistema Pagamenti**: Integrazione Stripe con storico transazioni
- **Notifiche**: Sistema notifiche per eventi booking e pagamenti
- **Reports & Analytics**: Dashboard statistiche e metriche

### Frontend (Next.js 14 + React + TailwindCSS)
- **Interfaccia Utente**: Registrazione, login, gestione profilo
- **Prenotazioni**: Creazione e gestione prenotazioni personali
- **Catalogo Risorse**: Browse e filtraggio risorse disponibili
- **Pannello Admin**: Interfaccia completa stile WordPress per amministratori

### Pannello Amministrativo
- **Dashboard**: Overview statistiche sistema
- **Moderazione Prenotazioni**: Approva/rifiuta richieste
- **Gestione Risorse**: CRUD completo con form avanzati
- **Gestione Utenti**: Assegnazione ruoli e permessi
- **Storico Pagamenti**: Visualizzazione transazioni
- **Calendario**: Vista mensile prenotazioni
- **Reports**: Analytics dettagliate e metriche

## 🚀 Stack Tecnologico

### Backend
- **NestJS**: Framework Node.js progressivo
- **Prisma ORM**: Database toolkit per PostgreSQL
- **PostgreSQL**: Database relazionale
- **Passport JWT**: Autenticazione stateless
- **Stripe**: Gateway pagamenti
- **Nodemailer**: Invio email notifiche

### Frontend
- **Next.js 14**: Framework React con App Router
- **React 18**: Libreria UI
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: State management
- **TypeScript**: Type safety

### DevOps
- **pnpm**: Package manager veloce
- **Monorepo**: Workspace con apps/api e apps/web
- **Docker**: Containerizzazione (opzionale)

## 📦 Struttura Progetto

```
baleno_booking_system/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/          # Autenticazione JWT/OAuth
│   │   │   ├── users/         # Gestione utenti
│   │   │   ├── bookings/      # Sistema prenotazioni
│   │   │   ├── resources/     # Gestione risorse
│   │   │   ├── payments/      # Sistema pagamenti
│   │   │   ├── notifications/ # Notifiche
│   │   │   ├── reports/       # Analytics
│   │   │   └── common/        # Guards, decorators, pipes
│   │   └── prisma/
│   │       ├── schema.prisma  # Schema database
│   │       └── seed.ts        # Seed dati iniziali
│   │
│   └── web/                   # Frontend Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── admin/     # Pannello amministrativo
│       │   │   ├── bookings/  # Gestione prenotazioni utente
│       │   │   ├── resources/ # Catalogo risorse
│       │   │   └── profile/   # Profilo utente
│       │   ├── components/
│       │   │   └── admin/     # Componenti admin
│       │   └── store/         # Zustand state management
│       └── public/
│
├── prisma/
│   └── schema.prisma          # Schema database condiviso
│
├── package.json               # Root package.json
└── pnpm-workspace.yaml        # Configurazione monorepo
```

## 🛠️ Setup Locale

### Prerequisiti
- Node.js >= 18.x
- pnpm >= 8.x
- PostgreSQL >= 14.x

### 1. Clona il Repository
```bash
git clone https://github.com/LinosCo/Baleno-Website.git
cd Baleno-Website
```

### 2. Installa Dipendenze
```bash
pnpm install
```

### 3. Setup Database
```bash
# Crea database PostgreSQL
createdb baleno_booking

# Configura variabili ambiente
cp apps/api/.env.example apps/api/.env
# Modifica apps/api/.env con le tue credenziali
```

### 4. Configurazione Ambiente

**apps/api/.env**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/baleno_booking"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

FRONTEND_URL="http://localhost:3001"
PORT=4000

# Stripe (opzionale per dev)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (opzionale per dev)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 5. Setup Database
```bash
# Genera Prisma Client
cd apps/api
pnpm prisma:generate

# Esegui migrations
pnpm prisma:migrate dev

# Seed dati iniziali (10 risorse di esempio)
pnpm prisma:seed
```

### 6. Avvia i Server

**Terminale 1 - Backend**
```bash
cd apps/api
pnpm dev
# Backend: http://localhost:4000/api
```

**Terminale 2 - Frontend**
```bash
cd apps/web
pnpm dev
# Frontend: http://localhost:3001
```

## 👤 Account di Test

### Creare un Admin
Dopo la registrazione, promuovi un utente ad admin:
```bash
cd apps/api
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  await prisma.user.update({
    where: { email: 'your-email@example.com' },
    data: { role: 'ADMIN' }
  });
  console.log('User promoted to ADMIN');
  await prisma.\$disconnect();
})();
"
```

## 🎯 Utilizzo

### Utente Standard
1. Vai su `http://localhost:3001`
2. Registrati o accedi
3. Naviga `/resources` per vedere risorse disponibili
4. Crea prenotazioni da `/bookings/new`
5. Gestisci le tue prenotazioni da `/bookings`

### Amministratore
1. Accedi con account ADMIN
2. Vai su `http://localhost:3001/admin`
3. Dashboard con statistiche sistema
4. Approva/rifiuta prenotazioni
5. Gestisci risorse (CRUD)
6. Gestisci utenti e ruoli
7. Visualizza storico pagamenti
8. Consulta reports e analytics

## 📚 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione utente
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Utente corrente
- `GET /api/auth/google` - Login Google OAuth

### Utenti (ADMIN only)
- `GET /api/users` - Lista utenti
- `GET /api/users/:id` - Dettaglio utente
- `PUT /api/users/:id` - Aggiorna utente
- `PUT /api/users/:id/role` - Cambia ruolo
- `DELETE /api/users/:id` - Elimina utente

### Risorse
- `GET /api/resources` - Lista risorse
- `GET /api/resources/:id` - Dettaglio risorsa
- `POST /api/resources` - Crea risorsa (ADMIN)
- `PUT /api/resources/:id` - Aggiorna risorsa (ADMIN)
- `DELETE /api/resources/:id` - Elimina risorsa (ADMIN)

### Prenotazioni
- `GET /api/bookings` - Mie prenotazioni
- `POST /api/bookings` - Crea prenotazione
- `GET /api/bookings/:id` - Dettaglio prenotazione
- `PUT /api/bookings/:id` - Aggiorna prenotazione
- `DELETE /api/bookings/:id` - Cancella prenotazione
- `PUT /api/bookings/:id/approve` - Approva (ADMIN/CM)
- `PUT /api/bookings/:id/reject` - Rifiuta (ADMIN/CM)
- `GET /api/bookings/public/calendar` - Calendario pubblico

### Pagamenti
- `GET /api/payments/history` - Storico pagamenti
- `GET /api/payments/:id/receipt` - Ricevuta pagamento
- `POST /api/payments/webhook` - Stripe webhook

### Reports (ADMIN/COMMUNITY_MANAGER)
- `GET /api/reports/dashboard` - Statistiche dashboard
- `GET /api/reports/bookings` - Report prenotazioni
- `GET /api/reports/revenue` - Report entrate
- `GET /api/reports/users` - Report utenti
- `GET /api/reports/resources` - Report risorse

## 🔐 Ruoli e Permessi

### USER
- Visualizza risorse pubbliche
- Crea proprie prenotazioni
- Gestisce proprio profilo
- Visualizza calendario pubblico

### COMMUNITY_MANAGER
- Tutti i permessi USER
- Approva/rifiuta prenotazioni
- Visualizza tutte le prenotazioni
- Accesso reports

### ADMIN
- Tutti i permessi COMMUNITY_MANAGER
- Gestione completa risorse (CRUD)
- Gestione utenti e ruoli
- Accesso completo pannello admin
- Configurazione sistema

## 📊 Database Schema

### Tabelle Principali
- **users**: Utenti con ruoli e autenticazione
- **resources**: Risorse prenotabili (sale, spazi, attrezzature)
- **bookings**: Prenotazioni con workflow approvazione
- **payments**: Transazioni e pagamenti Stripe
- **notifications**: Notifiche utenti
- **refresh_tokens**: Token JWT refresh

### Relazioni
- User → Bookings (1:N)
- User → Payments (1:N)
- Resource → Bookings (1:N)
- Booking → Payments (1:N)
- User → Notifications (1:N)

## 🚢 Deploy Produzione

Il progetto è configurato per deployment su **Railway** (backend + database) e **Vercel** (frontend).

### Documentazione Completa
Consulta [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md) per la guida dettagliata passo-passo per il deployment su Railway e Vercel.

### Quick Start Railway (Backend)

1. **Crea Progetto su Railway**
   - Connetti repository GitHub
   - Railway rileverà automaticamente il monorepo

2. **Configura Servizio @baleno/api**
   - Rimuovi il servizio @baleno/web (lo deploieremo su Vercel)
   - Aggiungi PostgreSQL database al progetto
   - **Root Directory**: `apps/api`
   - **Build Command**: Configurato automaticamente via `railway.json`
   - **Start Command**: Configurato automaticamente via `railway.json`

3. **Variabili d'Ambiente Railway**
   Aggiungi queste variabili al servizio @baleno/api:

   ```env
   # Database (aggiungi come riferimento)
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # App Config
   NODE_ENV=production
   PORT=4000

   # JWT Secrets (generati in DEPLOY_CONFIG.md)
   JWT_SECRET=AQ0n9dvYqlh3HHEphje0hXwGzYd2l3mr7WATvsh5KaQ=
   JWT_REFRESH_SECRET=+pu1k8kPWpUmn+WkinKF4E259t4zdnd6D+LzvmA7qxw=
   JWT_EXPIRES_IN=7d

   # Frontend URL (aggiorna dopo deploy Vercel)
   FRONTEND_URL=https://baleno-sanzeno.vercel.app

   # Stripe (usa le tue chiavi di produzione)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

   # Email Configuration
   EMAIL_FROM=noreply@balenosanzeno.it
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-specific-password

   # Google OAuth (opzionale)
   GOOGLE_CALLBACK_URL=https://your-api-url.up.railway.app/api/auth/google/callback
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Redis (opzionale per rate limiting)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   RATE_LIMIT_TTL=60
   ```

4. **Deploy Backend**
   - Railway deploierà automaticamente
   - Copia l'URL pubblico del servizio (es: `https://xxx.up.railway.app`)

5. **Esegui Migrations Database**
   ```bash
   # Dalla Railway CLI o dal dashboard
   pnpm --filter @baleno/api prisma:migrate deploy
   ```

### Quick Start Vercel (Frontend)

1. **Importa Progetto su Vercel**
   - Connetti repository GitHub
   - Framework: Next.js
   - **Root Directory**: `apps/web`

2. **Variabili d'Ambiente Vercel**
   ```env
   NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app/api
   ```

3. **Deploy Frontend**
   - Vercel deploierà automaticamente
   - Copia l'URL pubblico (es: `https://baleno-sanzeno.vercel.app`)

4. **Aggiorna Railway**
   - Torna su Railway
   - Aggiorna la variabile `FRONTEND_URL` con l'URL Vercel
   - Rideploy il servizio backend

### Post-Deploy

1. **Crea Admin**
   Connettiti al database Railway via CLI o GUI e promuovi un utente:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

2. **Configura Stripe Webhooks**
   - Dashboard Stripe → Webhooks
   - Endpoint: `https://your-railway-backend.up.railway.app/api/payments/webhook`
   - Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Test Sistema**
   - Registra un utente sul frontend
   - Crea una prenotazione
   - Verifica pannello admin
   - Test pagamento Stripe (usa carte di test)

## 🔧 Scripts Disponibili

### Root
```bash
pnpm install          # Installa tutte le dipendenze
pnpm dev             # Avvia tutti i server dev
pnpm build           # Build di tutti i progetti
pnpm type-check      # Type checking TypeScript
```

### Backend (apps/api)
```bash
pnpm dev             # Dev con hot-reload
pnpm build           # Build produzione
pnpm start:prod      # Start produzione
pnpm prisma:generate # Genera Prisma Client
pnpm prisma:migrate  # Esegui migrations
pnpm prisma:studio   # GUI database
pnpm prisma:seed     # Seed dati esempio
```

### Frontend (apps/web)
```bash
pnpm dev             # Dev server
pnpm build           # Build produzione
pnpm start           # Start produzione
pnpm lint            # Lint codice
```

## 📝 Note Sviluppo

### Dati di Test
Il seed script crea:
- 10 risorse diverse (sale conferenze, coworking, attrezzature)
- Risorse con prezzi, capacità e caratteristiche diverse

Per creare prenotazioni di test, usa l'interfaccia utente o il pannello admin.

### Stripe Testing
Usa carte di test Stripe:
- Successo: `4242 4242 4242 4242`
- Fallimento: `4000 0000 0000 0002`

### Email Development
In sviluppo, le email vengono loggate in console invece di essere inviate.

## 🤝 Contribuire

1. Fork il progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è proprietario di Baleno San Zeno.

## 🆘 Supporto

Per problemi o domande:
- Apri una issue su GitHub
- Contatta: info@balenosanzeno.it

## 📚 Documentazione Completa

Il progetto include documentazione dettagliata nella cartella `docs/`:

- **[docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md)** - Guida completa per il deployment su Railway e Vercel
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Guide di sviluppo, architettura e best practices
- **[docs/MIGRATION_HISTORY.md](docs/MIGRATION_HISTORY.md)** - Storia della migrazione a Bootstrap Italia

## 🎉 Stato Progetto

**Versione**: 1.0.0
**Stato**: ✅ DEPLOYED IN PRODUZIONE
**Ultimo Aggiornamento**: 30 Ottobre 2025

### 🌐 URL Produzione
- **Frontend**: https://baleno-website.vercel.app
- **Backend API**: https://baleno-website-production.up.railway.app/api
- **Database**: PostgreSQL su Railway (postgres.railway.internal)

### Completato ✅
- [x] Backend NestJS completo
- [x] Autenticazione JWT + OAuth Google
- [x] Sistema prenotazioni con moderazione
- [x] Gestione risorse CRUD
- [x] Sistema pagamenti Stripe
- [x] Frontend Next.js utente
- [x] Pannello amministrativo completo
- [x] Database Prisma + PostgreSQL
- [x] Reports e analytics
- [x] Calendario pubblico
- [x] Password recovery system
- [x] Client API centralizzato con Axios
- [x] Gestione ruoli admin automatica
- [x] **Bootstrap Italia design system** (v2.17.0 integrato in tutte le 16 pagine)
- [x] **Branding Baleno completo** (logo, colori, font Work Sans)
- [x] **Configurazione deployment Railway + Vercel**
- [x] **JWT secrets generati per produzione**
- [x] **railway.json configurato**
- [x] **Documentazione deployment completa** (docs/DEPLOY_GUIDE.md)

### Deployment Completato 🚀
- [x] Progetto su GitHub deployato
- [x] **Railway backend deployment** ✅ LIVE
  - [x] PostgreSQL database configurato e connesso
  - [x] Variabili d'ambiente configurate
  - [x] Migrazioni Prisma eseguite con successo
  - [x] Script di startup personalizzato (start.sh)
  - [x] CORS configurato per Vercel
  - [x] API endpoint testati e funzionanti
- [x] **Vercel frontend deployment** ✅ LIVE
  - [x] Build Next.js completato
  - [x] NEXT_PUBLIC_API_URL configurato
  - [x] Connessione API backend verificata
  - [x] Login e registrazione funzionanti
- [x] **Test produzione completo** ✅
  - [x] Registrazione utenti
  - [x] Autenticazione JWT
  - [x] Creazione prenotazioni
  - [x] Pannello admin accessibile

### In Sviluppo 🚧
- [ ] Integrazione email produzione
- [ ] Gestione upload immagini risorse
- [ ] Sistema review/feedback prenotazioni
- [ ] Notifiche push real-time
- [ ] Export reports CSV/PDF
- [ ] Dashboard analytics avanzate

### Pianificato 📅
- [ ] App mobile React Native
- [ ] Sistema membership/abbonamenti
- [ ] Gestione eventi pubblici
- [ ] Multi-tenant per altre locations
- [ ] Integrazione calendario esterno (Google Calendar, iCal)

## 📝 Note Recenti

### ✅ Deployment Produzione Completato (30 Ottobre 2025)

**Sistema deployato con successo su Railway + Vercel!**

#### Configurazione Produzione

**Railway (Backend)**
- Servizio: `Baleno-Website`
- Database: PostgreSQL configurato
- Variabili d'ambiente:
  - `DATABASE_URL`: Collegamento al PostgreSQL interno
  - `FRONTEND_URL`: https://baleno-website.vercel.app
  - `JWT_SECRET` e `JWT_REFRESH_SECRET`: Configurati
  - `NODE_ENV`: production
  - `PORT`: 4000
- **Script di startup personalizzato** (`apps/api/start.sh`):
  - Esegue migrazioni Prisma automaticamente all'avvio
  - Avvia l'applicazione dopo il setup del database
- **CORS**: Configurato per accettare richieste dal frontend Vercel

**Vercel (Frontend)**
- Progetto: `baleno-website`
- Root Directory: `apps/web`
- Build Command: `pnpm build`
- Variabili d'ambiente:
  - `NEXT_PUBLIC_API_URL`: https://baleno-website-production.up.railway.app/api

#### Problemi Risolti Durante il Deployment

1. **Network Error al Login/Registrazione**
   - Causa: Variabile `NEXT_PUBLIC_API_URL` non configurata su Vercel
   - Soluzione: Aggiunta variabile d'ambiente e redeploy

2. **CORS Error**
   - Causa: URL frontend diverso tra preview e produzione
   - Soluzione: `FRONTEND_URL` su Railway configurato con URL di produzione

3. **Database Tables Not Found**
   - Causa: Migrazioni Prisma non eseguite su Railway
   - Soluzione: Creato script `start.sh` che esegue le migrazioni all'avvio
   - File: `apps/api/start.sh`
   ```bash
   #!/bin/bash
   npx prisma migrate deploy --schema=../../prisma/schema.prisma
   node dist/main
   ```

4. **Migration Execution During Build**
   - Causa: Database non accessibile durante fase di build
   - Soluzione: Spostamento esecuzione migrazioni da `buildCommand` a `startCommand`

#### File Modificati per il Deployment

1. **`railway.json`** - Configurazione Railway
   - buildCommand: Install + generate + build
   - startCommand: Esegue `start.sh` con migrazioni

2. **`apps/api/start.sh`** - Script startup
   - Nuovo file creato per gestire migrazioni automatiche

3. **`apps/web/vercel.json`** - Configurazione Vercel
   - Framework: Next.js
   - Build command: pnpm build

#### Accesso al Sistema in Produzione

1. **Frontend**: https://baleno-website.vercel.app
2. **Registrazione**: Crea un nuovo account dalla pagina di registrazione
3. **Login**: Usa le credenziali create
4. **Promozione ad Admin**: Esegui query SQL sul database Railway:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'tuo-email@esempio.com';
   ```
5. **Pannello Admin**: Accedi a https://baleno-website.vercel.app/admin

### Pulizia Progetto e Organizzazione (30 Ottobre 2025)
- ✅ Bootstrap Italia integrato in tutte le 16 pagine
- ✅ Documentazione consolidata e organizzata in `docs/`
- ✅ File ridondanti rimossi
- ✅ README aggiornato con riferimenti corretti
- ✅ Progetto pulito e pronto per deployment professionale
- ✅ **Sistema completamente deployato e funzionante in produzione**
