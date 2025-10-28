import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { ResourceType } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(type?: ResourceType, isActive?: boolean) {
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const resources = await this.prisma.resource.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return resources;
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async create(createDto: CreateResourceDto) {
    const resource = await this.prisma.resource.create({
      data: {
        ...createDto,
        pricePerHour: createDto.pricePerHour,
      },
    });

    return resource;
  }

  async update(id: string, updateDto: UpdateResourceDto) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const updatedResource = await this.prisma.resource.update({
      where: { id },
      data: updateDto,
    });

    return updatedResource;
  }

  async remove(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Soft delete - mark as inactive
    await this.prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Resource deactivated successfully' };
  }
}
