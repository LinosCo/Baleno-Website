# TODO List - Baleno Booking System

## 🔴 Alta Priorità

### 1. Applicare Migration Database su Railway
**Status:** 🚧 DA FARE
**Tempo stimato:** 5 minuti
**Descrizione:** La migration per `booking_resources` è stata creata ma non applicata sul database produzione Railway.

**Azione:**
```bash
# Opzione 1: Via Railway CLI
railway run npx prisma migrate deploy

# Opzione 2: Via Railway Dashboard
# Variables → Add migration command to startCommand
```

**File coinvolti:**
- `prisma/migrations/20251107154522_add_booking_resources/migration.sql`

---

### 2. Creare Risorse EQUIPMENT per Test
**Status:** 🚧 DA FARE
**Tempo stimato:** 10 minuti
**Descrizione:** Per testare la feature "Ti serve altro?" servono risorse di tipo EQUIPMENT.

**Azione:**
1. Login come ADMIN su https://baleno-booking-system.vercel.app/admin
2. Vai su "Gestione Risorse" → "Nuova Risorsa"
3. Crea almeno 3-4 attrezzature:
   - **Videoproiettore**
     - Tipo: EQUIPMENT
     - Categoria: EQUIPMENT
     - Prezzo: €15/ora
     - Descrizione: "Videoproiettore Full HD con cavo HDMI"
   - **Lavagna Mobile**
     - Tipo: EQUIPMENT
     - Categoria: EQUIPMENT
     - Prezzo: €5/ora
   - **Impianto Audio**
     - Tipo: EQUIPMENT
     - Categoria: EQUIPMENT
     - Prezzo: €25/ora
   - **Servizio Catering**
     - Tipo: SERVICE
     - Categoria: SERVICE
     - Prezzo: €50/evento

---

### 3. Testare Feature "Ti serve altro?"
**Status:** 🚧 DA FARE
**Tempo stimato:** 15 minuti
**Prerequisiti:** Migration applicata + Risorse EQUIPMENT create

**Test Plan:**
1. **Logout** e registra un nuovo utente USER
2. Vai su `/bookings/new`
3. Completa Step 1-3 (sala, orario, dettagli)
4. **Step 4:** Dovresti vedere le attrezzature EQUIPMENT
   - ✅ Card visualizzate correttamente
   - ✅ Checkbox selezionabile
   - ✅ Input quantità funzionante
   - ✅ Prezzo totale si aggiorna
5. Seleziona 2-3 risorse con quantità diverse
6. **Step 5:** Conferma prenotazione
7. **Verifica backend:** Le associazioni in `booking_resources` sono salvate

**Query SQL verifica:**
```sql
SELECT br.*, r.name as resource_name, b.title as booking_title
FROM booking_resources br
JOIN resources r ON br."resourceId" = r.id
JOIN bookings b ON br."bookingId" = b.id
ORDER BY br."createdAt" DESC;
```

---

## 🟡 Media Priorità

### 4. Notifiche Email Automatiche
**Status:** ❌ NON IMPLEMENTATO
**Tempo stimato:** 2-3 ore
**Prerequisiti:** Account SendGrid/AWS SES/Gmail SMTP

**Implementazione:**

**Step 1: Setup SendGrid (Raccomandato)**
```bash
npm install @sendgrid/mail

# Railway Environment Variables
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@balenosanzeno.it
```

**Step 2: Modificare Notifications Service**
```typescript
// apps/api/src/notifications/notifications.service.ts
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendBookingConfirmation(booking: any, user: any) {
    const msg = {
      to: user.email,
      from: this.configService.get('EMAIL_FROM'),
      subject: 'Prenotazione Confermata - Baleno San Zeno',
      html: this.getBookingConfirmationTemplate(booking, user),
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  private getBookingConfirmationTemplate(booking: any, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><style>/* CSS qui */</style></head>
        <body>
          <h1>Prenotazione Confermata</h1>
          <p>Ciao ${user.firstName},</p>
          <p>La tua prenotazione è stata creata con successo.</p>
          <h2>Dettagli:</h2>
          <ul>
            <li><strong>Risorsa:</strong> ${booking.resource.name}</li>
            <li><strong>Data/Ora:</strong> ${new Date(booking.startTime).toLocaleString('it-IT')}</li>
            <li><strong>Durata:</strong> ${calculateHours(booking)} ore</li>
            <li><strong>Stato:</strong> In attesa di approvazione</li>
          </ul>
          <p>Riceverai un'email quando la prenotazione sarà approvata.</p>
        </body>
      </html>
    `;
  }
}
```

**Step 3: Chiamare Service nei Punti Corretti**
- ✅ Già chiamato in `bookings.service.ts` → `create()`
- Aggiungere in `approve()`, `reject()`, `cancel()`

**Eventi da notificare:**
- [x] Prenotazione creata (già implementato, manca solo email vera)
- [ ] Prenotazione approvata
- [ ] Prenotazione rifiutata
- [ ] Prenotazione cancellata
- [ ] Pagamento riuscito
- [ ] Pagamento fallito

---

### 5. Promemoria 24h Prima Prenotazione
**Status:** ❌ NON IMPLEMENTATO
**Tempo stimato:** 2-3 ore
**Prerequisiti:** Email funzionanti

**Implementazione:**

**Step 1: Aggiungere Campo al Schema**
```prisma
// prisma/schema.prisma
model Booking {
  // ... campi esistenti
  reminderSent  Boolean  @default(false)
}
```

**Step 2: Creare Migration**
```bash
npx prisma migrate dev --name add_reminder_sent_field
```

**Step 3: Installare Scheduler**
```bash
npm install @nestjs/schedule
```

**Step 4: Configurare Scheduler**
```typescript
// apps/api/src/app.module.ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... altri imports
  ],
})
```

**Step 5: Creare Scheduler Service**
```typescript
// apps/api/src/scheduler/reminder.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkUpcomingBookings() {
    this.logger.log('Checking for upcoming bookings needing reminders...');

    // Calcola finestra 23-24 ore
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookingsToRemind = await this.prisma.booking.findMany({
      where: {
        startTime: {
          gte: in23Hours,
          lt: in24Hours,
        },
        status: 'APPROVED',
        reminderSent: false,
      },
      include: {
        user: true,
        resource: true,
        additionalResources: {
          include: {
            resource: true,
          },
        },
      },
    });

    this.logger.log(`Found ${bookingsToRemind.length} bookings needing reminders`);

    for (const booking of bookingsToRemind) {
      try {
        await this.notificationsService.sendBookingReminder(booking);

        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        this.logger.log(`Reminder sent for booking ${booking.id}`);
      } catch (error) {
        this.logger.error(`Failed to send reminder for booking ${booking.id}:`, error);
      }
    }
  }
}
```

**Step 6: Registrare Scheduler**
```typescript
// apps/api/src/app.module.ts
@Module({
  imports: [ScheduleModule.forRoot(), ...],
  providers: [ReminderScheduler, ...],
})
```

**Step 7: Aggiungere Metodo Email**
```typescript
// apps/api/src/notifications/notifications.service.ts
async sendBookingReminder(booking: any) {
  const msg = {
    to: booking.user.email,
    from: this.configService.get('EMAIL_FROM'),
    subject: 'Promemoria Prenotazione - Domani alle ' + formatTime(booking.startTime),
    html: this.getBookingReminderTemplate(booking),
  };

  await sgMail.send(msg);
}

private getBookingReminderTemplate(booking: any): string {
  return `
    <h1>Promemoria Prenotazione</h1>
    <p>Ciao ${booking.user.firstName},</p>
    <p>Ti ricordiamo che domani hai una prenotazione:</p>
    <ul>
      <li><strong>Risorsa:</strong> ${booking.resource.name}</li>
      <li><strong>Orario:</strong> ${formatDateTime(booking.startTime)}</li>
      <li><strong>Durata:</strong> ${calculateHours(booking)} ore</li>
    </ul>
    ${booking.additionalResources.length > 0 ? `
      <p><strong>Attrezzature incluse:</strong></p>
      <ul>
        ${booking.additionalResources.map(ar =>
          `<li>${ar.resource.name} × ${ar.quantity}</li>`
        ).join('')}
      </ul>
    ` : ''}
    <p>Ci vediamo domani!</p>
  `;
}
```

---

## 🟢 Bassa Priorità

### 6. Upload Immagini Risorse
**Status:** ❌ NON IMPLEMENTATO
**Tempo stimato:** 3-4 ore

**Opzioni:**
- Cloudinary (raccomandato - free tier generoso)
- AWS S3
- Vercel Blob Storage

**Implementazione suggerita: Cloudinary**

### 7. Sistema Review/Feedback
**Status:** ❌ NON IMPLEMENTATO
**Tempo stimato:** 4-5 ore

**Feature:**
- Utente può lasciare review dopo booking completato
- Rating 1-5 stelle
- Commento testuale
- Visualizzazione media rating per risorsa

### 8. Export Reports CSV/PDF
**Status:** ❌ NON IMPLEMENTATO
**Tempo stimato:** 3-4 ore

**Feature:**
- Export prenotazioni in CSV
- Report mensili in PDF
- Grafici utilizzo risorse

---

## ✅ Completato

### Feature "Ti serve altro?" (Risorse Aggiuntive)
**Completato:** 7 Nov 2025
**Commit:** `2a55e26`, `5635889`

### Pulsante Elimina Utente Admin
**Completato:** 7 Nov 2025
**Commit:** `05bdc08`

### Fix Deployment Vercel
**Completato:** 7 Nov 2025
**Commit:** `3341261` - `9e30e3b`

### Calendario Google-Style
**Completato:** 3 Nov 2025

### Dashboard Admin Ridisegnato
**Completato:** 3 Nov 2025

### Seed Database Risorse Reali
**Completato:** 3 Nov 2025

---

## 📊 Statistiche Progetto

**Commit Totali:** ~60+
**Linee di Codice:** ~15,000+
**Feature Implementate:** 25+
**Feature Rimanenti:** 8
**Copertura Test:** 0% (da implementare)

---

## 🎯 Prossima Sessione Suggerita

**Ordine consigliato:**

1. ✅ Applicare migration su Railway (5 min)
2. ✅ Creare risorse EQUIPMENT (10 min)
3. ✅ Testare "Ti serve altro?" (15 min)
4. 📧 Setup SendGrid + Email notifications (2h)
5. ⏰ Implementare promemoria 24h (2h)
6. 🧪 Scrivere test E2E per booking flow (3h)

**Tempo totale stimato:** ~7-8 ore

---

## 📝 Note

- Migration `booking_resources` creata ma NON applicata su Railway
- Feature email/promemoria richiedono setup servizi esterni
- README e CHANGELOG aggiornati con ultima sessione
- Tutti i commit pushati su GitHub
