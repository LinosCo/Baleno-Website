import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBankInfo() {
  try {
    console.log('Aggiornamento dati bancari...');

    // Cerca se esiste già un record
    const existing = await prisma.paymentSettings.findFirst();

    if (existing) {
      // Aggiorna il record esistente
      const updated = await prisma.paymentSettings.update({
        where: { id: existing.id },
        data: {
          bankName: 'Banca Etica',
          bankAccountHolder: 'Associazione Baleno ETS',
          bankIBAN: 'IT74S0501811700000020000458',
          bankTransferEnabled: true,
        },
      });
      console.log('✅ Dati bancari aggiornati:', {
        bankName: updated.bankName,
        bankAccountHolder: updated.bankAccountHolder,
        bankIBAN: updated.bankIBAN,
      });
    } else {
      // Crea un nuovo record
      const created = await prisma.paymentSettings.create({
        data: {
          bankName: 'Banca Etica',
          bankAccountHolder: 'Associazione Baleno ETS',
          bankIBAN: 'IT74S0501811700000020000458',
          bankTransferEnabled: true,
          stripeEnabled: true,
          paymentDeadlineDays: 2,
          currency: 'EUR',
          taxRate: 22,
          invoicePrefix: 'INV',
          invoiceStartNumber: 1,
          currentInvoiceNumber: 1,
          sendReminders: true,
          paymentReminderHours: 24,
        },
      });
      console.log('✅ Dati bancari creati:', {
        bankName: created.bankName,
        bankAccountHolder: created.bankAccountHolder,
        bankIBAN: created.bankIBAN,
      });
    }
  } catch (error) {
    console.error('❌ Errore aggiornamento:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateBankInfo();
