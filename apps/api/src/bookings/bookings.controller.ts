import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('bookings')
@UseGuards(RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createDto: any, @CurrentUser() user: any) {
    return this.bookingsService.create(createDto, user);
  }

  @Get()
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.bookingsService.findAll(query, user);
  }

  @Public()
  @Get('public/calendar')
  async getPublicCalendar(@Query() query: any) {
    return this.bookingsService.getPublicCalendar(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.findOne(id, user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return this.bookingsService.update(id, updateDto, user);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.cancel(id, user);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.approve(id, user);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async reject(@Param('id') id: string, @Body() rejectDto: any, @CurrentUser() user: any) {
    return this.bookingsService.reject(id, rejectDto, user);
  }

  @Get('availability/check')
  async checkAvailability(@Query() query: any) {
    return this.bookingsService.checkAvailability(query);
  }
}
