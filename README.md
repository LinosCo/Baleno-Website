# Baleno Booking System

Sistema completo di prenotazione spazi e risorse per Baleno San Zeno, con backend NestJS, frontend Next.js e pannello amministrativo in stile WordPress.

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

### Backend
1. Setup PostgreSQL produzione
2. Configura variabili ambiente
3. Esegui migrations: `pnpm prisma:migrate deploy`
4. Build: `pnpm build`
5. Start: `pnpm start:prod`

### Frontend
1. Build Next.js: `pnpm build`
2. Deploy su Vercel/Railway
3. Configura `NEXT_PUBLIC_API_URL`

### Opzioni Deploy
- **Railway**: Deploy automatico per backend + database
- **Vercel**: Deploy frontend Next.js
- **Docker**: Container per deployment completo

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

## 🎉 Stato Progetto

**Versione**: 1.0.0
**Stato**: In Sviluppo Attivo

### Completato ✅
- [x] Backend NestJS completo
- [x] Autenticazione JWT + OAuth
- [x] Sistema prenotazioni con moderazione
- [x] Gestione risorse CRUD
- [x] Sistema pagamenti Stripe
- [x] Frontend Next.js utente
- [x] Pannello amministrativo completo
- [x] Database Prisma + PostgreSQL
- [x] Reports e analytics
- [x] Calendario pubblico

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
