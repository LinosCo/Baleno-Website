import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // TODO: Implement - Get all resources/spaces
    throw new Error('Not implemented yet');
  }

  async findOne(id: string) {
    // TODO: Implement - Get single resource
    throw new Error('Not implemented yet');
  }

  async create(createDto: any) {
    // TODO: Implement - Create new resource (Admin only)
    throw new Error('Not implemented yet');
  }

  async update(id: string, updateDto: any) {
    // TODO: Implement - Update resource
    throw new Error('Not implemented yet');
  }

  async remove(id: string) {
    // TODO: Implement - Soft delete resource
    throw new Error('Not implemented yet');
  }
}
