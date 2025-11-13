import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n=== UTENTI REGISTRATI ===\n');

    if (users.length === 0) {
      console.log('Nessun utente trovato.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Nome: ${user.firstName} ${user.lastName}`);
        console.log(`   Ruolo: ${user.role}`);
        console.log(`   Attivo: ${user.isActive ? 'Sì' : 'No'}`);
        console.log(`   Registrato: ${user.createdAt.toLocaleString('it-IT')}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });

      console.log(`Totale utenti: ${users.length}\n`);
    }
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
