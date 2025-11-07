# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-07

### Aggiunto

#### Feature "Ti serve altro?" (Risorse Aggiuntive)
- Sistema completo per aggiungere attrezzature/servizi extra alle prenotazioni
- Nuovo modello database `BookingResource` (many-to-many)
- Migration SQL per tabella `booking_resources`
- DTO `AdditionalResourceDto` per validazione input
- Step 5 "Ti serve altro?" nel wizard prenotazione frontend
- Calcolo prezzo dinamico che include risorse extra × quantità × ore
- UI card-based interattiva per selezione attrezzature
- Input quantità personalizzabile (1-10) per ogni risorsa
- Riepilogo risorse aggiuntive nella conferma prenotazione
- Backend include automatico risorse extra in `findAll()` e `findOne()`
- Wizard prenotazione esteso da 4 a 5 step

#### Gestione Utenti Admin
- Pulsante "Elimina" nella tabella utenti admin
- Conferma dialog prima dell'eliminazione con nome utente
- Metodo `usersAPI.delete()` nell'API client
- Nuova colonna "Azioni" nella tabella gestione utenti
- Cascade delete delle prenotazioni associate all'utente eliminato

### Risolto

#### Deployment Vercel
- Fix configurazione monorepo pnpm su Vercel
- Risolto problema 404 dopo aver reso repository privata
- Corretta configurazione Root Directory + Output Directory
- Rimosso `vercel.json` che causava conflitti
- Reconnessi webhook GitHub dopo cambio visibilità repository
- Aggiunta variabile d'ambiente `NEXT_PUBLIC_API_URL` su Vercel

### Modificato

- Schema database Prisma con relazione `Booking` ↔ `BookingResource` ↔ `Resource`
- Service bookings per supportare risorse aggiuntive nella creazione
- Wizard prenotazione con nuovo step per attrezzature opzionali
- Logica calcolo prezzo totale include ora risorse extra

### File Modificati

**Backend:**
- `prisma/schema.prisma` - Aggiunto modello BookingResource
- `prisma/migrations/20251107154522_add_booking_resources/migration.sql` - Nuova tabella
- `apps/api/src/bookings/dto/create-booking.dto.ts` - Aggiunto AdditionalResourceDto
- `apps/api/src/bookings/bookings.service.ts` - Logica risorse aggiuntive

**Frontend:**
- `apps/web/src/app/bookings/new/page.tsx` - Wizard con step 5
- `apps/web/src/app/admin/users/page.tsx` - UI elimina utente
- `apps/web/src/lib/api-client.ts` - Metodo delete utenti

**Documentazione:**
- `README.md` - Aggiornato con sezione completa 7 Nov 2025

### Commit

```
2a55e26 - Feat: Backend risorse aggiuntive per prenotazioni
5635889 - Feat: Wizard prenotazione con step 'Ti serve altro?'
05bdc08 - Feat: Pulsante elimina utente in admin panel
9e30e3b - Docs: README aggiornato con sessione 7 Nov 2025
```

---

## [1.1.0] - 2025-11-04

### Aggiunto

- Layout dashboard admin ottimizzato (~50px spazio risparmiato)
- Navbar compatta (padding ridotto, logo 45px)
- Card stats più compatte con spaziature ridotte
- Margini e padding ottimizzati in tutto il dashboard

### Modificato

- `apps/web/src/components/admin/AdminLayout.tsx` - Navbar compatta
- `apps/web/src/app/admin/page.tsx` - Spaziature ottimizzate

---

## [1.0.0] - 2025-11-03

### Aggiunto

#### Seed Database da Regolamento Baleno
- Endpoint pubblico `/api/seed` per inizializzazione database
- 9 risorse ufficiali da regolamento Baleno San Zeno
- Popolamento automatico database su Railway

#### UI/UX Miglioramenti
- Dashboard admin completamente ridisegnato senza emoji
- Icone Bootstrap Icons SVG professionali
- Calendario stile Google Calendar (vista settimana/mese)
- Gestione risorse con layout ottimizzato
- Badge tradotti in italiano (Approvata, In Attesa, ecc.)

#### Fix Tecnici
- URL API centralizzati in `apps/web/src/config/api.ts`
- Eliminati tutti gli URL hardcodati `localhost:4000`
- Gestione token JWT migliorata (durata 7 giorni)
- Salvataggio refresh token in localStorage

### Risolto

- Errore "Errore nel caricamento delle risorse" nel form prenotazioni
- Errore "Object is possibly undefined" in calendario (TypeScript)
- Errore "Invalid or expired token" tramite gestione refresh token
- Bug duplicati risorse dopo doppio seed
- Bug filtro `isActive` in GET `/api/resources`

### File Modificati

**Backend:**
- `apps/api/src/seed-endpoint.controller.ts` - Endpoint seed pubblico
- `apps/api/src/resources/resources.controller.ts` - Fix filtro isActive
- `apps/api/src/app.module.ts` - Registrazione controller seed

**Frontend:**
- `apps/web/src/config/api.ts` - Nuovo file configurazione API
- `apps/web/src/app/admin/page.tsx` - Dashboard ridisegnato
- `apps/web/src/app/admin/resources/page.tsx` - Layout ottimizzato
- `apps/web/src/app/admin/calendar/page.tsx` - Calendario Google-style
- `apps/web/src/app/bookings/new/page.tsx` - Fix URL API
- `apps/web/src/app/login/page.tsx` - Salvataggio refresh token

---

## [0.9.0] - 2025-10-30

### Aggiunto

- **Deployment Produzione Completato** ✅
- Backend su Railway con PostgreSQL
- Frontend su Vercel
- Script startup personalizzato (`apps/api/start.sh`)
- Migrazioni Prisma automatiche all'avvio
- CORS configurato per Vercel

### Risolto

- Network Error al Login/Registrazione (variabile `NEXT_PUBLIC_API_URL`)
- CORS Error (configurato `FRONTEND_URL` su Railway)
- Database Tables Not Found (script migrazioni automatiche)
- Migration Execution During Build (spostamento da build a start)

### File Aggiunti

- `railway.json` - Configurazione Railway
- `apps/api/start.sh` - Script startup con migrazioni

### URL Produzione

- Frontend: https://baleno-website.vercel.app
- Backend API: https://baleno-website-production.up.railway.app/api

---

## [0.8.0] - 2025-10-28

### Aggiunto

- Bootstrap Italia design system (v2.17.0) integrato
- Branding Baleno completo (logo, colori, font Work Sans)
- Documentazione deployment (docs/DEPLOY_GUIDE.md)
- JWT secrets generati per produzione
- Configurazione railway.json

### Modificato

- Tutte le 16 pagine con Bootstrap Italia
- Layout admin ridisegnato
- README consolidato e organizzato

---

## [0.7.0] - 2025-10-25

### Aggiunto

- Sistema prenotazioni completo con workflow approvazione
- Gestione risorse CRUD nel pannello admin
- Calendario pubblico per visualizzazione disponibilità
- Sistema pagamenti Stripe integrato
- Reports e analytics per amministratori
- Password recovery system

### Feature

- Autenticazione JWT con refresh tokens
- OAuth Google login
- Sistema notifiche per eventi booking
- Gestione ruoli (ADMIN, COMMUNITY_MANAGER, USER)
- Pannello amministrativo stile WordPress

---

## [0.1.0] - 2025-10-15

### Aggiunto

- Setup iniziale progetto monorepo pnpm
- Backend NestJS con Prisma ORM
- Frontend Next.js 14 con App Router
- Database PostgreSQL schema base
- Autenticazione JWT base
- CRUD utenti e risorse

---

## Feature Non Implementate (Roadmap)

### Alta Priorità
- [ ] Notifiche email automatiche (richiede SendGrid/SMTP setup)
- [ ] Promemoria 24h prima prenotazione (richiede cron scheduler)

### Media Priorità
- [ ] Upload immagini risorse (storage Cloudinary/S3)
- [ ] Sistema review/feedback prenotazioni
- [ ] Export reports CSV/PDF
- [ ] Dashboard analytics avanzate

### Bassa Priorità
- [ ] Notifiche push real-time
- [ ] App mobile React Native
- [ ] Sistema membership/abbonamenti
- [ ] Gestione eventi pubblici
- [ ] Multi-tenant per altre locations
- [ ] Integrazione calendario esterno (Google Calendar, iCal)

---

## Note di Versioning

- **MAJOR** (X.0.0): Cambiamenti breaking dell'API o schema database
- **MINOR** (0.X.0): Nuove feature backwards-compatible
- **PATCH** (0.0.X): Bug fix e miglioramenti minori
