import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter((key) => typeof key === 'string' && key[0] !== '_');

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof typeof this] as any;
        return model?.deleteMany ? model.deleteMany() : Promise.resolve();
      }),
    );
  }
}
