import { PrismaClient, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create sample resources
  const resources = [
    {
      name: 'Sala Conferenze Grande',
      type: ResourceType.ROOM,
      description: 'Sala conferenze spaziosa con proiettore, lavagna e connessione WiFi ad alta velocità. Perfetta per riunioni aziendali e presentazioni.',
      capacity: 50,
      pricePerHour: 35,
      isActive: true,
      location: 'Piano 2, Ala Est',
      amenities: ['Proiettore', 'WiFi', 'Lavagna', 'Aria condizionata', 'Caffè'],
      images: [],
    },
    {
      name: 'Sala Riunioni Piccola',
      type: ResourceType.ROOM,
      description: 'Sala riunioni intima per meeting riservati e brainstorming. Dotata di TV e sistema audio.',
      capacity: 8,
      pricePerHour: 15,
      isActive: true,
      location: 'Piano 1, Ala Ovest',
      amenities: ['TV 50"', 'WiFi', 'Lavagnetta', 'Sistema audio'],
      images: [],
    },
    {
      name: 'Spazio Coworking',
      type: ResourceType.SPACE,
      description: 'Spazio aperto per lavoro individuale o di gruppo. Include scrivanie condivise e area relax.',
      capacity: 20,
      pricePerHour: 10,
      isActive: true,
      location: 'Piano 1, Area Centrale',
      amenities: ['WiFi', 'Prese elettriche', 'Stampante', 'Area caffè', 'Piante'],
      images: [],
    },
    {
      name: 'Studio Podcast/Video',
      type: ResourceType.ROOM,
      description: 'Studio professionale per registrazioni podcast e video con attrezzatura completa.',
      capacity: 5,
      pricePerHour: 45,
      isActive: true,
      location: 'Piano 3, Studio A',
      amenities: ['Microfoni professionali', 'Telecamere 4K', 'Luci', 'Green screen', 'Software editing'],
      images: [],
    },
    {
      name: 'Proiettore Portatile HD',
      type: ResourceType.EQUIPMENT,
      description: 'Proiettore HD portatile con schermo incluso, ideale per presentazioni in mobilità.',
      capacity: 1,
      pricePerHour: 8,
      isActive: true,
      location: 'Reception - Servizio noleggio',
      amenities: ['Full HD 1080p', 'HDMI', 'WiFi', 'Telecomando', 'Schermo portatile'],
      images: [],
    },
    {
      name: 'Servizio Catering',
      type: ResourceType.SERVICE,
      description: 'Servizio catering per eventi e riunioni, include caffè, bevande e snack.',
      capacity: 50,
      pricePerHour: 20,
      isActive: true,
      location: 'Servizio su richiesta',
      amenities: ['Caffè', 'Tè', 'Snack dolci', 'Snack salati', 'Acqua', 'Succhi'],
      images: [],
    },
    {
      name: 'Sala Formazione',
      type: ResourceType.ROOM,
      description: 'Sala ideale per corsi di formazione e workshop, con postazioni individuali.',
      capacity: 30,
      pricePerHour: 28,
      isActive: true,
      location: 'Piano 2, Ala Ovest',
      amenities: ['30 postazioni', 'Proiettore', 'Lavagna interattiva', 'WiFi', 'Aria condizionata'],
      images: [],
    },
    {
      name: 'Palestra Comunale',
      type: ResourceType.SPACE,
      description: 'Palestra per eventi sportivi, allenamenti e attività ricreative.',
      capacity: 100,
      pricePerHour: 50,
      isActive: true,
      location: 'Centro Sportivo',
      amenities: ['Campo basket', 'Campo pallavolo', 'Spogliatoi', 'Docce', 'Parcheggio'],
      images: [],
    },
    {
      name: 'Laptop MacBook Pro',
      type: ResourceType.EQUIPMENT,
      description: 'MacBook Pro 16" per lavoro grafico e video editing.',
      capacity: 1,
      pricePerHour: 12,
      isActive: false,
      location: 'Reception - Servizio noleggio',
      amenities: ['16" Retina', '32GB RAM', '1TB SSD', 'Final Cut Pro', 'Adobe Creative Cloud'],
      images: [],
    },
    {
      name: 'Terrazza Panoramica',
      type: ResourceType.SPACE,
      description: 'Terrazza all\'aperto con vista panoramica, perfetta per eventi estivi e aperitivi.',
      capacity: 60,
      pricePerHour: 40,
      isActive: true,
      location: 'Piano 4, Roof Top',
      amenities: ['Vista panoramica', 'Bar', 'Ombrelloni', 'Impianto audio', 'Illuminazione'],
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

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
