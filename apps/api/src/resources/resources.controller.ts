import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { UserRole, ResourceType } from '@prisma/client';

@Controller('resources')
@UseGuards(RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Public()
  @Get()
  async findAll(@Query('type') type?: ResourceType, @Query('isActive') isActive?: string) {
    return this.resourcesService.findAll(type, isActive === 'true');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: CreateResourceDto) {
    return this.resourcesService.create(createDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async update(@Param('id') id: string, @Body() updateDto: UpdateResourceDto) {
    return this.resourcesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
