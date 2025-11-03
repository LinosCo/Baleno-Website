import { Controller, Post } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './common/decorators/public.decorator';

@Controller('cleanup-duplicates')
export class CleanupDuplicatesController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Post()
  async cleanup() {
    try {
      // IDs da eliminare (duplicati)
      const duplicateIds = [
        'cmhjasjfq00081ilx5a4kqb9y', // Baleno Completo
        'cmhjasjfz000a1ilxaruk3oxi', // Impianto Audio Completo
        'cmhjasjg7000b1ilxmfd64fm9', // Lavagne a Fogli Mobili
        'cmhj7kwb40007ds480bdyxg2d', // Navata Centrale
        'cmhj7kvnn0003ds4899578esw', // Navata Pipino Completa
        'cmhj7kvx00004ds48wsvz81yo', // Sala Riunioni Pipino
        'cmhj7kw6e0006ds48xamp9nk4', // Sala Riunioni Spagna
        'cmhjasjfa00051ilxev3c6p6q', // Spazio Libero Pipino
        'cmhjasjfu00091ilxccz0tz0d', // Videoproiettore
      ];

      const deleted = await this.prisma.resource.deleteMany({
        where: {
          id: {
            in: duplicateIds,
          },
        },
      });

      return {
        success: true,
        message: 'Duplicati rimossi con successo',
        deletedCount: deleted.count,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Errore nella rimozione dei duplicati',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
