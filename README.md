# Baleno Booking System

Sistema completo di gestione prenotazioni per balenosanzeno.it

## Architettura

Monorepo basato su pnpm workspaces e Turbo per gestione build e caching.

### Stack Tecnologico

**Backend:**
- NestJS (Node.js framework)
- PostgreSQL (database relazionale)
- Redis (caching e sessioni)
- Prisma ORM (type-safe database access)
- Passport + JWT (autenticazione)
- Stripe (pagamenti)

**Frontend:**
- Next.js 14+ (React framework con App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- TanStack Query (gestione stato server)
- Zustand (gestione stato client)

**DevOps:**
- Docker
- Railway (backend deployment)
- Vercel (frontend deployment)
- GitHub Actions (CI/CD)

## Struttura del Progetto

```
baleno_booking_system/
├── apps/
│   ├── api/              # Backend NestJS
│   └── web/              # Frontend Next.js
├── packages/
│   ├── types/            # TypeScript types condivisi
│   ├── ui/               # Componenti UI condivisi
│   ├── config/           # Configurazioni condivise
│   └── utils/            # Utilities condivise
├── prisma/               # Database schema e migrations
└── docker/               # Docker configurations
```

## Funzionalità Principali

### Gestione Utenti e Ruoli
- **Admin**: gestione completa sistema
- **Community Manager**: moderazione prenotazioni e contenuti
- **Utente Registrato**: prenotazioni e gestione profilo

### Sistema di Prenotazione
- Calendario interattivo con disponibilità real-time
- Filtri avanzati per spazi e risorse
- Gestione prenotazioni (crea, modifica, cancella)
- Storico prenotazioni

### Sistema di Pagamento
- Integrazione Stripe
- Ricevute automatiche
- Storico pagamenti
- Gestione rimborsi

### Dashboard Amministrativa
- Moderazione prenotazioni
- Gestione utenti e ruoli
- Report e analytics
- Sincronizzazione calendario pubblico

### Calendario Pubblico
- Visualizzazione prenotazioni approvate
- Aggiornamenti real-time
- Responsive e mobile-first

### Sistema di Notifiche
- Email notifications
- Push notifications (opzionale)
- Notifiche per conferme, modifiche, cancellazioni

## Installazione

### Prerequisiti
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14
- Redis (opzionale per development)

### Setup

```bash
# Installa dipendenze
pnpm install

# Setup database
pnpm --filter @baleno/api prisma:generate
pnpm --filter @baleno/api prisma:migrate

# Avvia in development
pnpm dev
```

### Variabili d'Ambiente

Crea file `.env` nelle directory `apps/api` e `apps/web` seguendo i file `.env.example`.

## Development

```bash
# Avvia tutti i servizi
pnpm dev

# Avvia solo backend
pnpm --filter @baleno/api dev

# Avvia solo frontend
pnpm --filter @baleno/web dev

# Build per produzione
pnpm build

# Lint
pnpm lint

# Format codice
pnpm format

# Type checking
pnpm type-check
```

## Deploy

### Backend (Railway)
Il backend viene deployato automaticamente su Railway tramite GitHub Actions quando viene effettuato push su `main`.

### Frontend (Vercel)
Il frontend viene deployato automaticamente su Vercel quando viene effettuato push su `main`.

## Testing

```bash
# Run tutti i test
pnpm test

# Run test con coverage
pnpm test:coverage
```

## Sicurezza

- HTTPS obbligatorio in produzione
- JWT tokens con refresh mechanism
- Rate limiting su API
- Input validation con Zod
- CORS configurato correttamente
- Database connection pooling
- GDPR compliant

## Licenza

Proprietary - Tutti i diritti riservati
