import { PrismaClient, ResourceType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@balenosanzeno.it' },
    update: {},
    create: {
      email: 'admin@balenosanzeno.it',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Baleno',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Community Manager user
  const cmPassword = await bcrypt.hash('cm123', 10);
  const cm = await prisma.user.upsert({
    where: { email: 'cm@balenosanzeno.it' },
    update: {},
    create: {
      email: 'cm@balenosanzeno.it',
      password: cmPassword,
      firstName: 'Community',
      lastName: 'Manager',
      role: UserRole.COMMUNITY_MANAGER,
      emailVerified: true,
    },
  });
  console.log('✅ Community Manager created:', cm.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      emailVerified: true,
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create resources from REGOLAMENTO BALENO
  const resources = [
    // A. NAVATA PIPINO
    {
      name: 'Navata Pipino Completa',
      type: ResourceType.ROOM,
      description: 'Sala polifunzionale attrezzata con sala riunioni (Orata), area morbida, calcetto, ping pong, giochi. Ideale per laboratori, formazioni, riunioni. Tariffe: 1h €50 | 2h €90 | ½ giornata €120 | 1 giornata €180',
      capacity: 40,
      pricePerHour: 50.0,
      isActive: true,
      location: 'Navata Pipino - 74 mq',
      amenities: ['Sala riunioni Orata', 'Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Wi-Fi'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      images: [],
    },
    {
      name: 'Sala Riunioni Pipino',
      type: ResourceType.ROOM,
      description: 'Sala riunioni dotata di tavolo rettangolare e 8 sedie ed eventuali sedute supplementari. Ideale per incontri di piccoli gruppi, riunioni, corsi e laboratori di vario genere. Tariffe: 1h €20 | 2h €35 | ½ giornata €60 | 1 giornata €100',
      capacity: 8,
      pricePerHour: 20.0,
      isActive: true,
      location: 'Navata Pipino - 18.5 mq',
      amenities: ['Tavolo rettangolare', '8 sedie', 'Sedute supplementari disponibili', 'Wi-Fi'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      images: [],
    },
    {
      name: 'Spazio Libero Pipino',
      type: ResourceType.SPACE,
      description: 'Sala attrezzata con area morbida, calcetto, ping pong, giochi. Ideale per attività destinate a bambini e ragazzi (spazio compiti, ludoteca, spazio lettura). Tariffe: 1h €50 | 2h €90 | ½ giornata €120 | 1 giornata €180',
      capacity: 25,
      pricePerHour: 50.0,
      isActive: true,
      location: 'Navata Pipino - 37 mq',
      amenities: ['Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Spazio lettura'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      images: [],
    },

    // B. NAVATA SPAGNA
    {
      name: 'Sala Riunioni Spagna',
      type: ResourceType.ROOM,
      description: 'Sala riunioni dotata di tavolo rotondo, 8 sedie ed eventuali sedute supplementari. Ideale per incontri di piccoli gruppi, riunioni, corsi e laboratori di vario genere. Tariffe: 1h €20 | 2h €35 | ½ giornata €60 | 1 giornata €100',
      capacity: 8,
      pricePerHour: 20.0,
      isActive: true,
      location: 'Navata Spagna - 18.5 mq',
      amenities: ['Tavolo rotondo', '8 sedie', 'Sedute supplementari disponibili', 'Wi-Fi'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      images: [],
    },

    // C. NAVATA CENTRALE
    {
      name: 'Navata Centrale',
      type: ResourceType.ROOM,
      description: 'Salone polifunzionale attrezzato con 6 tavoli pieghevoli, 4 set tavolino e sedia, 48 sedie pieghevoli, Service audio/video. Eventuale utilizzo di ripostiglio e frigorifero da concordare. Tariffe: 2h €120 | ½ giornata €200 | 1 giornata €400',
      capacity: 100,
      pricePerHour: 60.0,
      isActive: true,
      location: 'Navata Centrale - 148 mq',
      amenities: ['6 tavoli pieghevoli', '4 set tavolino e sedia', '48 sedie pieghevoli', 'Service audio/video', 'Ripostiglio (da concordare)', 'Frigorifero (da concordare)'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
      images: [],
    },

    // D. BALENO COMPLETO
    {
      name: 'Baleno Completo',
      type: ResourceType.SPACE,
      description: 'Spazio completo con tutte le dotazioni disponibili. Eventuale utilizzo di ripostiglio e frigorifero da concordare. Include tutte le navate e attrezzature. Tariffe: ½ giornata €400 | 1 giornata €800',
      capacity: 150,
      pricePerHour: 100.0,
      isActive: true,
      location: 'Intero edificio - 314.5 mq',
      amenities: ['Tutte le sale', 'Videoproiettore', 'Impianto stereo completo', 'Microfono con asta', 'Mixer 12 ingressi', '2 casse 800W', 'Lavagne a fogli mobili', 'Tavoli pieghevoli', 'Frigorifero'],
      rules: 'Vietato fumare. Riordinare tutte le sale prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
      images: [],
    },

    // ATTREZZATURE AGGIUNTIVE
    {
      name: 'Videoproiettore',
      type: ResourceType.EQUIPMENT,
      description: 'Videoproiettore professionale disponibile a noleggio. Da richiedere contestualmente alla prenotazione dello spazio.',
      capacity: null,
      pricePerHour: 10.0,
      isActive: true,
      location: 'Attrezzatura mobile',
      amenities: ['Videoproiettore HD', 'Cavo HDMI', 'Telecomando'],
      rules: 'Utilizzare con cura. Segnalare eventuali malfunzionamenti.',
      images: [],
    },
    {
      name: 'Impianto Audio Completo',
      type: ResourceType.EQUIPMENT,
      description: 'Impianto stereo e voce con 1 microfono con asta, mixer 12 ingressi e 2 casse da 800W. Da richiedere contestualmente alla prenotazione dello spazio.',
      capacity: null,
      pricePerHour: 25.0,
      isActive: true,
      location: 'Attrezzatura mobile',
      amenities: ['Microfono con asta', 'Mixer 12 ingressi', '2 casse 800W', 'Cavi audio'],
      rules: 'Utilizzare con cura. Non superare il volume massimo. Segnalare eventuali malfunzionamenti.',
      images: [],
    },
    {
      name: 'Lavagne a Fogli Mobili',
      type: ResourceType.EQUIPMENT,
      description: 'Lavagne a fogli mobili (flipchart) per presentazioni e workshop. Da richiedere contestualmente alla prenotazione dello spazio.',
      capacity: null,
      pricePerHour: 5.0,
      isActive: true,
      location: 'Attrezzatura mobile',
      amenities: ['Lavagna con fogli', 'Pennarelli colorati', 'Cancellino'],
      rules: 'Utilizzare con cura. Riportare al posto originale dopo l\'uso.',
      images: [],
    },
  ];

  console.log('Creating resources...');
  for (const resource of resources) {
    const created = await prisma.resource.create({
      data: resource,
    });
    console.log(`✅ Created: ${created.name}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
