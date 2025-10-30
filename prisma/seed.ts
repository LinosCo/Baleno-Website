import { PrismaClient, UserRole, ResourceType } from '@prisma/client';
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

  // A. NAVATA PIPINO
  const navataCompleta = await prisma.resource.create({
    data: {
      name: 'Navata Pipino Completa',
      description: 'Sala polifunzionale attrezzata con sala riunioni (Orata), area morbida, calcetto, ping pong, giochi. Ideale per laboratori, formazioni, riunioni. Tariffe: 1h €50 | 2h €90 | ½ giornata €120 | 1 giornata €180',
      type: ResourceType.ROOM,
      capacity: 40,
      pricePerHour: 50.0,
      images: [],
      amenities: ['Sala riunioni Orata', 'Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Wi-Fi'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      location: 'Navata Pipino - 74 mq',
    },
  });
  console.log('✅ Resource created:', navataCompleta.name);

  const salaPipino = await prisma.resource.create({
    data: {
      name: 'Sala Riunioni Pipino',
      description: 'Sala riunioni dotata di tavolo rettangolare e 8 sedie ed eventuali sedute supplementari. Ideale per incontri di piccoli gruppi, riunioni, corsi e laboratori di vario genere. Tariffe: 1h €20 | 2h €35 | ½ giornata €60 | 1 giornata €100',
      type: ResourceType.ROOM,
      capacity: 8,
      pricePerHour: 20.0,
      images: [],
      amenities: ['Tavolo rettangolare', '8 sedie', 'Sedute supplementari disponibili', 'Wi-Fi'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      location: 'Navata Pipino - 18.5 mq',
    },
  });
  console.log('✅ Resource created:', salaPipino.name);

  const spazioLibero = await prisma.resource.create({
    data: {
      name: 'Spazio Libero Pipino',
      description: 'Sala attrezzata con area morbida, calcetto, ping pong, giochi. Ideale per attività destinate a bambini e ragazzi (spazio compiti, ludoteca, spazio lettura). Tariffe: 1h €50 | 2h €90 | ½ giornata €120 | 1 giornata €180',
      type: ResourceType.SPACE,
      capacity: 25,
      pricePerHour: 50.0,
      images: [],
      amenities: ['Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Spazio lettura'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      location: 'Navata Pipino - 37 mq',
    },
  });
  console.log('✅ Resource created:', spazioLibero.name);

  // B. NAVATA SPAGNA
  const salaSpagna = await prisma.resource.create({
    data: {
      name: 'Sala Riunioni Spagna',
      description: 'Sala riunioni dotata di tavolo rotondo, 8 sedie ed eventuali sedute supplementari. Ideale per incontri di piccoli gruppi, riunioni, corsi e laboratori di vario genere. Tariffe: 1h €20 | 2h €35 | ½ giornata €60 | 1 giornata €100',
      type: ResourceType.ROOM,
      capacity: 8,
      pricePerHour: 20.0,
      images: [],
      amenities: ['Tavolo rotondo', '8 sedie', 'Sedute supplementari disponibili', 'Wi-Fi'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Cauzione €50.',
      location: 'Navata Spagna - 18.5 mq',
    },
  });
  console.log('✅ Resource created:', salaSpagna.name);

  // C. NAVATA CENTRALE
  const navataCentrale = await prisma.resource.create({
    data: {
      name: 'Navata Centrale',
      description: 'Salone polifunzionale attrezzato con 6 tavoli pieghevoli, 4 set tavolino e sedia, 48 sedie pieghevoli, Service audio/video. Eventuale utilizzo di ripostiglio e frigorifero da concordare. Tariffe: 2h €120 | ½ giornata €200 | 1 giornata €400',
      type: ResourceType.ROOM,
      capacity: 100,
      pricePerHour: 60.0,
      images: [],
      amenities: ['6 tavoli pieghevoli', '4 set tavolino e sedia', '48 sedie pieghevoli', 'Service audio/video', 'Ripostiglio (da concordare)', 'Frigorifero (da concordare)'],
      rules: 'Vietato fumare. Riordinare la sala prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
      location: 'Navata Centrale - 148 mq',
    },
  });
  console.log('✅ Resource created:', navataCentrale.name);

  // D. BALENO COMPLETO
  const balenoCompleto = await prisma.resource.create({
    data: {
      name: 'Baleno Completo',
      description: 'Spazio completo con tutte le dotazioni disponibili. Eventuale utilizzo di ripostiglio e frigorifero da concordare. Include tutte le navate e attrezzature. Tariffe: ½ giornata €400 | 1 giornata €800',
      type: ResourceType.SPACE,
      capacity: 150,
      pricePerHour: 100.0,
      images: [],
      amenities: ['Tutte le sale', 'Videoproiettore', 'Impianto stereo completo', 'Microfono con asta', 'Mixer 12 ingressi', '2 casse 800W', 'Lavagne a fogli mobili', 'Tavoli pieghevoli', 'Frigorifero'],
      rules: 'Vietato fumare. Riordinare tutte le sale prima di lasciare la struttura. Spegnere luci e riscaldamento/aria condizionata. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
      location: 'Intero edificio - 314.5 mq',
    },
  });
  console.log('✅ Resource created:', balenoCompleto.name);

  // ATTREZZATURE AGGIUNTIVE
  const videoproiettore = await prisma.resource.create({
    data: {
      name: 'Videoproiettore',
      description: 'Videoproiettore professionale disponibile a noleggio. Da richiedere contestualmente alla prenotazione dello spazio.',
      type: ResourceType.EQUIPMENT,
      pricePerHour: 10.0,
      images: [],
      amenities: ['Videoproiettore HD', 'Cavo HDMI', 'Telecomando'],
      rules: 'Utilizzare con cura. Segnalare eventuali malfunzionamenti.',
    },
  });
  console.log('✅ Resource created:', videoproiettore.name);

  const impiantoAudio = await prisma.resource.create({
    data: {
      name: 'Impianto Audio Completo',
      description: 'Impianto stereo e voce con 1 microfono con asta, mixer 12 ingressi e 2 casse da 800W. Da richiedere contestualmente alla prenotazione dello spazio.',
      type: ResourceType.EQUIPMENT,
      pricePerHour: 25.0,
      images: [],
      amenities: ['Microfono con asta', 'Mixer 12 ingressi', '2 casse 800W', 'Cavi audio'],
      rules: 'Utilizzare con cura. Non superare il volume massimo. Segnalare eventuali malfunzionamenti.',
    },
  });
  console.log('✅ Resource created:', impiantoAudio.name);

  const lavagne = await prisma.resource.create({
    data: {
      name: 'Lavagne a Fogli Mobili',
      description: 'Lavagne a fogli mobili (flipchart) per presentazioni e workshop. Da richiedere contestualmente alla prenotazione dello spazio.',
      type: ResourceType.EQUIPMENT,
      pricePerHour: 5.0,
      images: [],
      amenities: ['Lavagna con fogli', 'Pennarelli colorati', 'Cancellino'],
      rules: 'Utilizzare con cura. Riportare al posto originale dopo l\'uso.',
    },
  });
  console.log('✅ Resource created:', lavagne.name);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
