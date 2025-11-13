import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utenti da eliminare (inserisci qui gli ID o email)
const usersToDelete = [
  'alessandroborsato99@gmail.com',
  'alessandro@linos.co',
  'a.borsato@linosandco.com',
  'aleborsi@icloud.com',
];

async function deleteUsers() {
  try {
    console.log('\n=== ELIMINAZIONE UTENTI ===\n');

    for (const email of usersToDelete) {
      console.log(`Cercando utente: ${email}...`);

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          bookings: true,
          payments: true,
        },
      });

      if (!user) {
        console.log(`  ❌ Utente non trovato\n`);
        continue;
      }

      console.log(`  Trovato: ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`  Prenotazioni: ${user.bookings.length}`);
      console.log(`  Pagamenti: ${user.payments.length}`);

      // Elimina prima le relazioni
      if (user.bookings.length > 0) {
        console.log(`  Eliminando ${user.bookings.length} prenotazioni...`);
        await prisma.booking.deleteMany({
          where: { userId: user.id },
        });
      }

      if (user.payments.length > 0) {
        console.log(`  Eliminando ${user.payments.length} pagamenti...`);
        await prisma.payment.deleteMany({
          where: { userId: user.id },
        });
      }

      // Elimina refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      // Elimina l'utente
      await prisma.user.delete({
        where: { id: user.id },
      });

      console.log(`  ✅ Utente eliminato con successo!\n`);
    }

    console.log('=== OPERAZIONE COMPLETATA ===\n');
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUsers();
