# Bootstrap Italia Integration - TODO

## Stato Attuale

### ✅ Completato (Sessione 1 - 30 Ottobre 2025)

1. **Infrastruttura**
   - ✅ Bootstrap Italia installato (v2.17.0)
   - ✅ design-react-kit installato (v5.9.0)
   - ✅ Tailwind CSS completamente rimosso
   - ✅ PostCSS config rimosso
   - ✅ globals.css aggiornato con colori Baleno e override Bootstrap Italia

2. **Componenti Base**
   - ✅ **Homepage** (`apps/web/src/app/page.tsx`)
     - Navbar con logo Baleno
     - Hero section
     - Feature cards
     - Footer con crediti Lino's & Co

   - ✅ **AdminLayout** (`apps/web/src/components/admin/AdminLayout.tsx`)
     - Top navbar con logo
     - Sidebar collapsibile
     - Navigation menu con icone
     - User info e logout button
     - Responsive design

3. **Database**
   - ✅ 9 risorse reali dal REGOLAMENTO BALENO popolate
   - ✅ 3 utenti di test (admin, community manager, user)

### 🔄 Lavoro Rimanente

#### 1. Pagine Autenticazione (PRIORITÀ ALTA)

**File da refactorare:**
- `apps/web/src/app/login/page.tsx` - Login page
- `apps/web/src/app/register/page.tsx` - Registrazione

**Componenti Bootstrap Italia da usare:**
- `.card` per il container
- `.form-control` per gli input
- `.btn btn-primary` per i bottoni
- `.alert alert-danger` per gli errori
- `.form-label` per le label

**Esempio struttura:**
```tsx
<div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
  <div className="card shadow-lg" style={{ maxWidth: '400px' }}>
    <div className="card-body">
      <h1 className="h3 mb-3 text-center">Accedi</h1>
      <form>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" />
        </div>
        <button className="btn btn-primary w-100">Accedi</button>
      </form>
    </div>
  </div>
</div>
```

#### 2. Dashboard Utente (PRIORITÀ ALTA)

**File:** `apps/web/src/app/dashboard/page.tsx`

**Componenti:**
- `.row` e `.col-*` per layout grid
- `.card` per le card statistiche
- `.table` per tabelle
- `.btn` per azioni

#### 3. Pagine Admin (PRIORITÀ MEDIA)

**File da refactorare:**
- `apps/web/src/app/admin/page.tsx` - Dashboard admin
- `apps/web/src/app/admin/bookings/page.tsx` - Gestione prenotazioni
- `apps/web/src/app/admin/resources/page.tsx` - Gestione risorse
- `apps/web/src/app/admin/users/page.tsx` - Gestione utenti
- `apps/web/src/app/admin/payments/page.tsx` - Pagamenti
- `apps/web/src/app/admin/calendar/page.tsx` - Calendario
- `apps/web/src/app/admin/reports/page.tsx` - Report

**Pattern comune per tutte le pagine admin:**
```tsx
<div>
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h1 className="h3">Titolo Pagina</h1>
    <button className="btn btn-primary">Azione</button>
  </div>

  <div className="card">
    <div className="card-body">
      {/* Contenuto */}
    </div>
  </div>
</div>
```

#### 4. Pagine Prenotazioni (PRIORITÀ MEDIA)

**File:**
- `apps/web/src/app/bookings/page.tsx` - Lista prenotazioni utente
- `apps/web/src/app/bookings/new/page.tsx` - Nuova prenotazione

#### 5. Altre Pagine (PRIORITÀ BASSA)

**File:**
- `apps/web/src/app/resources/page.tsx` - Catalogo risorse
- `apps/web/src/app/profile/page.tsx` - Profilo utente
- `apps/web/src/app/calendar/page.tsx` - Calendario pubblico

#### 6. Componenti UI Personalizzati

**Potenziali componenti da creare:**
- `components/ui/Button.tsx` (wrapper Bootstrap Italia)
- `components/ui/Card.tsx`
- `components/ui/Alert.tsx`
- `components/ui/Badge.tsx`

## Colori Baleno

```css
--baleno-primary: #2B548E (Blu Baleno)
--baleno-accent: #EDBB00 (Giallo Baleno)
--baleno-secondary: #1863DC (Blu chiaro)
```

## Classi Bootstrap Italia più utilizzate

### Layout
- `.container`, `.container-fluid`
- `.row`, `.col-*`
- `.d-flex`, `.align-items-center`, `.justify-content-between`

### Componenti
- `.card`, `.card-body`, `.card-title`, `.card-text`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline-*`
- `.table`, `.table-striped`, `.table-hover`
- `.form-control`, `.form-label`, `.form-select`
- `.alert`, `.alert-*`
- `.badge`, `.badge-*`
- `.navbar`, `.nav`, `.nav-link`

### Utility
- `.mb-*`, `.mt-*`, `.p-*` (spacing)
- `.text-center`, `.text-end` (text alignment)
- `.fw-bold`, `.fw-semibold` (font weight)
- `.bg-primary`, `.bg-light`, `.bg-white`
- `.text-primary`, `.text-muted`, `.text-white`
- `.shadow`, `.shadow-sm`, `.shadow-lg`
- `.rounded`, `.rounded-*`

## Note Importanti

1. **Accessibilità**: Bootstrap Italia include già molte best practice per l'accessibilità
2. **Responsive**: Usare sempre le classi responsive (`d-none d-md-block`, `.col-md-6`, etc.)
3. **Colori**: Sovrascrivere i colori primary con i colori Baleno tramite CSS custom
4. **Icone**: Continuare ad usare lucide-react per le icone
5. **Font**: Bootstrap Italia usa già font ottimizzati, non serve caricare font custom

## Comandi Utili

```bash
# Dev server
pnpm --filter @baleno/web dev

# Build
pnpm --filter @baleno/web build

# Type check
pnpm --filter @baleno/web type-check

# Vedere database
pnpm --filter @baleno/api prisma:studio
```

## Risorse

- [Bootstrap Italia Docs](https://italia.github.io/bootstrap-italia/)
- [Design React Kit Docs](https://github.com/italia/design-react-kit)
- [Designers Italia](https://designers.italia.it/)

## Prossimi Passi

1. Completare refactoring pagine autenticazione
2. Refactorare dashboard utente
3. Refactorare pagine admin una per una
4. Test completo di tutte le pagine
5. Fix eventuali bug di layout
6. Deploy su Railway + Vercel

---

**Sviluppato da Lino's & Co**
