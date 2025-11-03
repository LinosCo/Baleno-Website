import { Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ResourceType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async seed() {
    try {
      // Create Admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = await this.prisma.user.upsert({
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

      // Create Community Manager user
      const cmPassword = await bcrypt.hash('cm123', 10);
      const cm = await this.prisma.user.upsert({
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

      // Create test user
      const userPassword = await bcrypt.hash('user123', 10);
      const user = await this.prisma.user.upsert({
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

      // Create resources from REGOLAMENTO BALENO
      const resources = [
        {
          name: 'Navata Pipino Completa',
          type: ResourceType.ROOM,
          description: 'Sala polifunzionale attrezzata con sala riunioni (Orata), area morbida, calcetto, ping pong, giochi. Ideale per laboratori, formazioni, riunioni.',
          capacity: 40,
          pricePerHour: 50.0,
          location: 'Navata Pipino - 74 mq',
          amenities: ['Sala riunioni Orata', 'Area morbida', 'Calcetto', 'Ping pong', 'Giochi', 'Wi-Fi'],
          rules: 'Vietato fumare. Riordinare la sala. Cauzione €50.',
          images: [],
        },
        {
          name: 'Sala Riunioni Pipino',
          type: ResourceType.ROOM,
          description: 'Sala riunioni dotata di tavolo rettangolare e 8 sedie. Ideale per riunioni e laboratori.',
          capacity: 8,
          pricePerHour: 20.0,
          location: 'Navata Pipino - 18.5 mq',
          amenities: ['Tavolo rettangolare', '8 sedie', 'Wi-Fi'],
          rules: 'Vietato fumare. Riordinare la sala. Cauzione €50.',
          images: [],
        },
        {
          name: 'Spazio Libero Pipino',
          type: ResourceType.SPACE,
          description: 'Sala attrezzata con area morbida, calcetto, ping pong, giochi. Ideale per bambini e ragazzi.',
          capacity: 25,
          pricePerHour: 50.0,
          location: 'Navata Pipino - 37 mq',
          amenities: ['Area morbida', 'Calcetto', 'Ping pong', 'Giochi'],
          rules: 'Vietato fumare. Riordinare la sala. Cauzione €50.',
          images: [],
        },
        {
          name: 'Sala Riunioni Spagna',
          type: ResourceType.ROOM,
          description: 'Sala riunioni dotata di tavolo rotondo e 8 sedie. Ideale per piccoli gruppi.',
          capacity: 8,
          pricePerHour: 20.0,
          location: 'Navata Spagna - 18.5 mq',
          amenities: ['Tavolo rotondo', '8 sedie', 'Wi-Fi'],
          rules: 'Vietato fumare. Riordinare la sala. Cauzione €50.',
          images: [],
        },
        {
          name: 'Navata Centrale',
          type: ResourceType.ROOM,
          description: 'Salone polifunzionale con tavoli, sedie e service audio/video.',
          capacity: 100,
          pricePerHour: 60.0,
          location: 'Navata Centrale - 148 mq',
          amenities: ['6 tavoli pieghevoli', '48 sedie', 'Audio/video'],
          rules: 'Vietato fumare. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
          images: [],
        },
        {
          name: 'Baleno Completo',
          type: ResourceType.SPACE,
          description: 'Spazio completo con tutte le dotazioni disponibili.',
          capacity: 150,
          pricePerHour: 100.0,
          location: 'Intero edificio - 314.5 mq',
          amenities: ['Tutte le sale', 'Videoproiettore', 'Impianto stereo', 'Mixer'],
          rules: 'Vietato fumare. Eventi oltre 100 persone richiedono responsabile sicurezza. Cauzione €50.',
          images: [],
        },
        {
          name: 'Videoproiettore',
          type: ResourceType.EQUIPMENT,
          description: 'Videoproiettore professionale disponibile a noleggio.',
          capacity: null,
          pricePerHour: 10.0,
          location: 'Attrezzatura mobile',
          amenities: ['Videoproiettore HD', 'Cavo HDMI'],
          rules: 'Utilizzare con cura.',
          images: [],
        },
        {
          name: 'Impianto Audio Completo',
          type: ResourceType.EQUIPMENT,
          description: 'Impianto stereo con microfono, mixer e casse da 800W.',
          capacity: null,
          pricePerHour: 25.0,
          location: 'Attrezzatura mobile',
          amenities: ['Microfono', 'Mixer 12 ingressi', '2 casse 800W'],
          rules: 'Utilizzare con cura. Non superare il volume massimo.',
          images: [],
        },
        {
          name: 'Lavagne a Fogli Mobili',
          type: ResourceType.EQUIPMENT,
          description: 'Lavagne a fogli mobili (flipchart) per presentazioni.',
          capacity: null,
          pricePerHour: 5.0,
          location: 'Attrezzatura mobile',
          amenities: ['Lavagna con fogli', 'Pennarelli colorati'],
          rules: 'Utilizzare con cura.',
          images: [],
        },
      ];

      const createdResources = [];
      for (const resource of resources) {
        const created = await this.prisma.resource.create({
          data: resource,
        });
        createdResources.push(created);
      }

      return {
        success: true,
        message: 'Database seeded successfully!',
        data: {
          users: [admin, cm, user],
          resources: createdResources,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error seeding database',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
