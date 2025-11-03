# Development Guide

Guida completa per lo sviluppo su Baleno Booking System.

## Architettura

Il progetto utilizza un'architettura **monorepo** gestita con **pnpm workspaces** e **Turborepo**.

```
baleno_booking_system/
├── apps/
│   ├── api/              # Backend NestJS
│   └── web/              # Frontend Next.js
├── packages/
│   ├── types/            # Types condivisi
│   ├── utils/            # Utilities condivise
│   └── config/           # Configurazioni condivise
├── prisma/               # Database schema
└── docker/               # Docker configurations
```

## Stack Tecnologico

### Backend (apps/api)

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **Cache**: Redis (opzionale)
- **Auth**: JWT + Passport
- **Payments**: Stripe
- **Email**: Nodemailer

### Frontend (apps/web)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe Elements

### Shared Packages

- **@baleno/types**: TypeScript types e interfaces
- **@baleno/utils**: Utilities (date, currency, validation)
- **@baleno/config**: Configurazioni e costanti

## Struttura Backend

### Moduli Principali

```
apps/api/src/
├── auth/                 # Autenticazione (JWT, OAuth)
├── users/                # Gestione utenti
├── bookings/             # Sistema prenotazioni
├── payments/             # Stripe integrazione
├── notifications/        # Email & push notifications
├── resources/            # Gestione spazi/risorse
├── reports/              # Analytics e report
├── common/               # Guards, decorators, filters
└── prisma/               # Prisma service
```

### Creazione nuovo modulo

```bash
# Generate con NestJS CLI
cd apps/api
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

### Guards e Decorators

#### JwtAuthGuard (Autenticazione)

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('protected')
export class ProtectedController {
  // Tutti gli endpoint richiedono autenticazione
}
```

#### RolesGuard (Autorizzazione)

```typescript
import { Roles, UserRole } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
@Delete(':id')
async deleteResource(@Param('id') id: string) {
  // Solo Admin e CM possono accedere
}
```

#### CurrentUser (Decorator)

```typescript
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Get('profile')
async getProfile(@CurrentUser() user: any) {
  return user; // User object dal JWT
}
```

#### Public (Decorator)

```typescript
import { Public } from '@/common/decorators/public.decorator';

@Public() // Bypass autenticazione
@Get('public-data')
async getPublicData() {
  return { data: 'public' };
}
```

### Database con Prisma

#### Creare nuova tabella

1. Modifica `prisma/schema.prisma`:

```prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("new_models")
}
```

2. Crea migration:

```bash
pnpm --filter @baleno/api prisma:migrate
# Inserisci nome migration quando richiesto
```

3. Rigenera Prisma Client:

```bash
pnpm --filter @baleno/api prisma:generate
```

#### Query esempi

```typescript
// Nel service
constructor(private prisma: PrismaService) {}

// Create
async create(data: CreateDto) {
  return this.prisma.model.create({ data });
}

// Find one
async findOne(id: string) {
  return this.prisma.model.findUnique({
    where: { id },
    include: { relation: true },
  });
}

// Find many con paginazione
async findMany(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.model.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.model.count(),
  ]);

  return { data, total, page, limit };
}

// Update
async update(id: string, data: UpdateDto) {
  return this.prisma.model.update({
    where: { id },
    data,
  });
}

// Delete (soft delete consigliato)
async delete(id: string) {
  return this.prisma.model.update({
    where: { id },
    data: { isActive: false },
  });
}
```

## Struttura Frontend

### Pagine (App Router)

```
apps/web/src/app/
├── (auth)/               # Auth pages (login, register)
│   ├── login/
│   └── register/
├── (dashboard)/          # Protected dashboard
│   ├── bookings/
│   ├── profile/
│   └── admin/
├── calendar/             # Public calendar
├── page.tsx              # Home page
└── layout.tsx            # Root layout
```

### Creare nuova pagina

```typescript
// apps/web/src/app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}

// Metadata
export const metadata = {
  title: 'New Page - Baleno',
  description: 'Description',
};
```

### Componenti

Organizzazione consigliata:

```
apps/web/src/components/
├── ui/                   # Componenti base (shadcn/ui)
├── features/             # Feature-specific components
│   ├── bookings/
│   ├── calendar/
│   └── payments/
├── layout/               # Layout components (Header, Footer, Nav)
└── providers.tsx         # React Context providers
```

### API Calls con TanStack Query

```typescript
// hooks/use-bookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/bookings');
      return data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: CreateBookingDto) => {
      const { data } = await apiClient.post('/bookings', booking);
      return data;
    },
    onSuccess: () => {
      // Invalida cache per refresh
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// In component
function BookingForm() {
  const createBooking = useCreateBooking();

  const handleSubmit = (data) => {
    createBooking.mutate(data, {
      onSuccess: () => {
        toast.success('Prenotazione creata!');
      },
      onError: (error) => {
        toast.error('Errore nella creazione');
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Forms con React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const bookingSchema = z.object({
  title: z.string().min(3, 'Minimo 3 caratteri'),
  startTime: z.date(),
  endTime: z.date(),
  resourceId: z.string(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function BookingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = (data: BookingFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  );
}
```

### State Management (Zustand)

```typescript
// stores/booking-store.ts
import { create } from 'zustand';

interface BookingState {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  filters: {},
  setFilters: (filters) => set({ filters }),
}));

// In component
function Calendar() {
  const { selectedDate, setSelectedDate } = useBookingStore();

  return <DatePicker date={selectedDate} onDateChange={setSelectedDate} />;
}
```

## Testing

### Backend Tests (Jest)

```typescript
// bookings.service.spec.ts
import { Test } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BookingsService, PrismaService],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a booking', async () => {
    const booking = { title: 'Test', /* ... */ };
    const result = await service.create(booking, user);
    expect(result).toBeDefined();
    expect(result.title).toBe('Test');
  });
});
```

### Frontend Tests (Jest + Testing Library)

```typescript
// BookingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookingCard } from './BookingCard';

describe('BookingCard', () => {
  it('renders booking title', () => {
    const booking = { title: 'Test Booking', /* ... */ };
    render(<BookingCard booking={booking} />);
    expect(screen.getByText('Test Booking')).toBeInTheDocument();
  });
});
```

## Code Style & Conventions

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces/Types**: `PascalCase`

### Commit Messages

Segui [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add booking calendar component
fix: resolve date timezone issue
docs: update setup guide
refactor: simplify auth flow
test: add booking service tests
chore: update dependencies
```

## Best Practices

### Backend

1. **Validazione Input**: Usa `class-validator` DTO
2. **Error Handling**: Usa custom exceptions di NestJS
3. **Logging**: Usa NestJS logger integrato
4. **Security**: Validazione, sanitizzazione, rate limiting
5. **Performance**: Usa caching con Redis quando appropriato

### Frontend

1. **Components**: Piccoli, riutilizzabili, single responsibility
2. **Performance**: Lazy loading, code splitting, memoization
3. **Accessibility**: ARIA labels, keyboard navigation
4. **SEO**: Metadata, semantic HTML
5. **Mobile**: Design mobile-first

## Debugging

### Backend

```bash
# Debug mode
pnpm --filter @baleno/api start:debug

# Attach debugger in VS Code
# Add to .vscode/launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Attach NestJS",
  "port": 9229,
  "restart": true
}
```

### Frontend

```bash
# Next.js debug
NODE_OPTIONS='--inspect' pnpm --filter @baleno/web dev
```

### Database

```bash
# Prisma Studio (GUI)
pnpm --filter @baleno/api prisma:studio

# Query logs
# In apps/api/src/prisma/prisma.service.ts
log: ['query', 'info', 'warn', 'error']
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
