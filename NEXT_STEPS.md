# Next Steps - Implementazione Funzionalità

L'architettura completa è stata creata. Ora è necessario implementare la logica di business nei vari moduli.

## Priorità di Implementazione

### 1. Sistema di Autenticazione (Alta Priorità)

**File da completare:**
- `apps/api/src/auth/auth.service.ts`
- `apps/api/src/users/users.service.ts`

**Funzionalità da implementare:**
- ✅ Struttura moduli creata
- ⏳ Implementare registrazione utente con hash password
- ⏳ Implementare login con validazione credenziali
- ⏳ Implementare refresh token logic
- ⏳ Implementare OAuth Google (opzionale)
- ⏳ Creare pagine frontend login/register

**Stima**: 1-2 giorni

---

### 2. Gestione Utenti (Alta Priorità)

**File da completare:**
- `apps/api/src/users/users.service.ts`

**Funzionalità da implementare:**
- ⏳ CRUD completo utenti
- ⏳ Gestione ruoli (Admin, CM, User)
- ⏳ Update profilo utente
- ⏳ Dashboard admin per gestione utenti (frontend)

**Stima**: 1 giorno

---

### 3. Gestione Risorse (Alta Priorità)

**File da completare:**
- `apps/api/src/resources/resources.service.ts`

**Funzionalità da implementare:**
- ⏳ CRUD completo risorse/spazi
- ⏳ Upload immagini
- ⏳ Gestione disponibilità
- ⏳ Pagina pubblica lista risorse (frontend)
- ⏳ Pagina admin gestione risorse (frontend)

**Stima**: 1-2 giorni

---

### 4. Sistema di Prenotazione (Massima Priorità)

**File da completare:**
- `apps/api/src/bookings/bookings.service.ts`

**Funzionalità da implementare:**
- ⏳ Creazione prenotazione con validazione disponibilità
- ⏳ Check overlapping bookings
- ⏳ Calcolo prezzo automatico
- ⏳ Workflow approvazione (PENDING → APPROVED/REJECTED)
- ⏳ Cancellazione con refund
- ⏳ Calendario interattivo (frontend)
- ⏳ Form prenotazione (frontend)
- ⏳ Lista prenotazioni utente (frontend)
- ⏳ Dashboard moderazione per CM/Admin (frontend)

**Stima**: 3-4 giorni

---

### 5. Sistema di Pagamento Stripe (Massima Priorità)

**File da completare:**
- `apps/api/src/payments/payments.service.ts`

**Funzionalità da implementare:**
- ⏳ Creare Payment Intent Stripe
- ⏳ Confermare pagamento
- ⏳ Gestire webhook Stripe
- ⏳ Generare ricevute
- ⏳ Processare rimborsi
- ⏳ Integrazione Stripe Elements (frontend)
- ⏳ Storico pagamenti (frontend)

**Stima**: 2-3 giorni

---

### 6. Sistema di Notifiche (Media Priorità)

**File da completare:**
- `apps/api/src/notifications/notifications.service.ts`

**Funzionalità da implementare:**
- ⏳ Template email (HTML)
- ⏳ Invio email conferma prenotazione
- ⏳ Invio email approvazione/rifiuto
- ⏳ Invio email cancellazione
- ⏳ Invio ricevuta pagamento
- ⏳ Centro notifiche (frontend)
- ⏳ Badge non lette (frontend)

**Stima**: 2 giorni

---

### 7. Calendario Pubblico (Media Priorità)

**Funzionalità da implementare:**
- ⏳ API endpoint calendario pubblico
- ⏳ Pagina calendario pubblico (frontend)
- ⏳ Real-time updates con polling o WebSocket
- ⏳ Filtri per risorsa, data, tipo

**Stima**: 1-2 giorni

---

### 8. Dashboard Admin & Reports (Media Priorità)

**File da completare:**
- `apps/api/src/reports/reports.service.ts`

**Funzionalità da implementare:**
- ⏳ Statistiche dashboard (bookings, revenue, users)
- ⏳ Report prenotazioni
- ⏳ Report revenue
- ⏳ Report utilizzo risorse
- ⏳ Export CSV/PDF
- ⏳ Charts e grafici (frontend)

**Stima**: 2-3 giorni

---

### 9. Features Aggiuntive (Bassa Priorità)

**Funzionalità da implementare:**
- ⏳ Sistema di feedback/recensioni
- ⏳ Notifiche push (PWA)
- ⏳ Sistema di membership
- ⏳ Eventi ricorrenti
- ⏳ Multi-language support
- ⏳ Dark mode
- ⏳ Mobile app (React Native)

**Stima**: Variabile

---

## Guide di Implementazione Rapida

### Implementare Register/Login

```typescript
// apps/api/src/auth/auth.service.ts
async register(registerDto: RegisterDto) {
  // 1. Validare input
  const { email, password, firstName, lastName } = registerDto;

  // 2. Check se email esiste già
  const exists = await this.prisma.user.findUnique({ where: { email } });
  if (exists) throw new ConflictException('Email già registrata');

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Creare utente
  const user = await this.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'USER',
    },
  });

  // 5. Generare tokens
  const tokens = await this.generateTokens(user.id, user.email, user.role);

  // 6. Salvare refresh token
  await this.prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}
```

### Implementare Creazione Booking

```typescript
// apps/api/src/bookings/bookings.service.ts
async create(createDto: CreateBookingDto, user: any) {
  const { resourceId, startTime, endTime, title, description, attendees } = createDto;

  // 1. Validare date
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    throw new BadRequestException('Data inizio deve essere prima di data fine');
  }

  if (start < new Date()) {
    throw new BadRequestException('Non puoi prenotare nel passato');
  }

  // 2. Check risorsa esiste
  const resource = await this.prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource || !resource.isActive) {
    throw new NotFoundException('Risorsa non trovata');
  }

  // 3. Check disponibilità (no overlapping bookings)
  const overlapping = await this.prisma.booking.findFirst({
    where: {
      resourceId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
        },
        {
          AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
        },
        {
          AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
        },
      ],
    },
  });

  if (overlapping) {
    throw new ConflictException('Risorsa non disponibile in questo orario');
  }

  // 4. Calcola prezzo
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const amount = resource.pricePerHour * hours;

  // 5. Crea booking
  const booking = await this.prisma.booking.create({
    data: {
      userId: user.id,
      resourceId,
      startTime: start,
      endTime: end,
      title,
      description,
      attendees,
      status: 'PENDING',
    },
    include: {
      resource: true,
      user: true,
    },
  });

  // 6. Crea payment intent Stripe
  const paymentIntent = await this.paymentsService.createPaymentIntent(
    {
      bookingId: booking.id,
      amount,
    },
    user,
  );

  // 7. Invia notifica
  await this.notificationsService.sendBookingConfirmation(booking, user);

  return {
    booking,
    paymentIntent,
  };
}
```

### Implementare Check Availability

```typescript
// apps/api/src/bookings/bookings.service.ts
async checkAvailability(query: any) {
  const { resourceId, startTime, endTime } = query;

  const overlapping = await this.prisma.booking.findMany({
    where: {
      resourceId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          AND: [
            { startTime: { lte: new Date(startTime) } },
            { endTime: { gt: new Date(startTime) } },
          ],
        },
        {
          AND: [
            { startTime: { lt: new Date(endTime) } },
            { endTime: { gte: new Date(endTime) } },
          ],
        },
      ],
    },
  });

  return {
    available: overlapping.length === 0,
    conflictingBookings: overlapping,
  };
}
```

---

## Testing Checklist

### Backend Testing

```bash
# Test registrazione
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Test protected endpoint
curl -X GET http://localhost:4000/api/bookings \
  -H "Authorization: Bearer <access_token>"
```

### Frontend Testing

1. Test form validazione
2. Test autenticazione flow
3. Test creazione booking
4. Test pagamento Stripe (test mode)
5. Test responsive design
6. Test accessibilità

---

## Stima Totale Implementazione

**Tempo stimato completo**: 2-3 settimane (1 developer full-time)

**Breakdown**:
- Autenticazione: 1-2 giorni
- Gestione utenti: 1 giorno
- Gestione risorse: 1-2 giorni
- Sistema prenotazioni: 3-4 giorni
- Sistema pagamenti: 2-3 giorni
- Notifiche: 2 giorni
- Calendario pubblico: 1-2 giorni
- Dashboard & Reports: 2-3 giorni
- Testing & bug fixing: 2-3 giorni

---

## Risorse Utili

### Documentazione

- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Next.js Forms](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)

### Esempio Codice

- [NestJS + Prisma Example](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs)
- [Next.js + Stripe Example](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)
- [React Hook Form + Zod](https://github.com/react-hook-form/react-hook-form/tree/master/examples/V7/zodResolver)

---

## Supporto

Per domande o problemi durante l'implementazione, contatta il team o apri una issue su GitHub.

Buon coding! 🚀
