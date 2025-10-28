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

  // Create sample resources
  const salaGrande = await prisma.resource.create({
    data: {
      name: 'Sala Grande',
      description: 'Sala principale per eventi, riunioni e attività di gruppo',
      type: ResourceType.ROOM,
      capacity: 50,
      pricePerHour: 25.0,
      images: [],
      amenities: ['Wi-Fi', 'Proiettore', 'Sistema audio', 'Sedie', 'Tavoli'],
      rules: 'Non fumare. Lasciare la sala pulita e in ordine.',
      location: 'Piano terra',
    },
  });
  console.log('✅ Resource created:', salaGrande.name);

  const salaRiunioni = await prisma.resource.create({
    data: {
      name: 'Sala Riunioni',
      description: 'Sala più piccola ideale per meeting e workshop',
      type: ResourceType.ROOM,
      capacity: 15,
      pricePerHour: 15.0,
      images: [],
      amenities: ['Wi-Fi', 'TV', 'Lavagna', 'Sedie', 'Tavolo conferenze'],
      rules: 'Non fumare. Lasciare la sala pulita e in ordine.',
      location: 'Primo piano',
    },
  });
  console.log('✅ Resource created:', salaRiunioni.name);

  const spazioCoworking = await prisma.resource.create({
    data: {
      name: 'Spazio Coworking',
      description: 'Spazio aperto per lavoro condiviso',
      type: ResourceType.SPACE,
      capacity: 10,
      pricePerHour: 5.0,
      images: [],
      amenities: ['Wi-Fi', 'Scrivanie', 'Sedie', 'Caffè'],
      location: 'Primo piano',
    },
  });
  console.log('✅ Resource created:', spazioCoworking.name);

  const attrezzatura = await prisma.resource.create({
    data: {
      name: 'Attrezzatura Audio/Video',
      description: 'Set completo di attrezzatura per eventi',
      type: ResourceType.EQUIPMENT,
      pricePerHour: 10.0,
      images: [],
      amenities: ['Microfoni', 'Casse', 'Mixer', 'Luci'],
    },
  });
  console.log('✅ Resource created:', attrezzatura.name);

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
