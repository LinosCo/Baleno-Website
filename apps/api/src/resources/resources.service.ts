import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { ResourceType } from '@prisma/client';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const where: any = {};

    // Type filter
    if (query.type) {
      where.type = query.type;
    }

    // Category filter
    if (query.category) {
      where.category = query.category;
    }

    // Active status filter
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    // Maintenance mode filter
    if (query.maintenanceMode !== undefined) {
      where.maintenanceMode = query.maintenanceMode === 'true';
    }

    // Capacity filters
    if (query.minCapacity || query.maxCapacity) {
      where.capacity = {};
      if (query.minCapacity) {
        where.capacity.gte = parseInt(query.minCapacity);
      }
      if (query.maxCapacity) {
        where.capacity.lte = parseInt(query.maxCapacity);
      }
    }

    // Price filters
    if (query.minPrice || query.maxPrice) {
      where.pricePerHour = {};
      if (query.minPrice) {
        where.pricePerHour.gte = parseFloat(query.minPrice);
      }
      if (query.maxPrice) {
        where.pricePerHour.lte = parseFloat(query.maxPrice);
      }
    }

    // Wheelchair accessible filter
    if (query.wheelchairAccessible !== undefined) {
      where.wheelchairAccessible = query.wheelchairAccessible === 'true';
    }

    // Tags filter (resources that have ANY of the provided tags)
    if (query.tags) {
      const tagsArray = Array.isArray(query.tags) ? query.tags : [query.tags];
      where.tags = {
        hasSome: tagsArray,
      };
    }

    // Search filter (name or description)
    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
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
