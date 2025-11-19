import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from './dto';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { UserRole } from '@prisma/client';

@Controller('bookings')
@UseGuards(RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createDto: CreateBookingDto, @CurrentUser() user: any) {
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
  async update(@Param('id') id: string, @Body() updateDto: UpdateBookingDto, @CurrentUser() user: any) {
    return this.bookingsService.update(id, updateDto, user);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Body() cancelDto: CancelBookingDto, @CurrentUser() user: any) {
    return this.bookingsService.cancel(id, cancelDto, user);
  }

  @Delete(':id/force')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.bookingsService.delete(id);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.approve(id, approveDto, user);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async reject(@Param('id') id: string, @Body() rejectDto: RejectBookingDto, @CurrentUser() user: any) {
    return this.bookingsService.reject(id, rejectDto, user);
  }

  @Put(':id/mark-payment-received')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async markPaymentReceived(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.markPaymentReceived(id, user);
  }

  @Put(':id/mark-invoice-issued')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async markInvoiceIssued(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.markInvoiceIssued(id, user);
  }

  @Get('availability/check')
  async checkAvailability(@Query() query: any) {
    return this.bookingsService.checkAvailability(query);
  }

  @Get('export/csv')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async exportCsv(@Query() query: any, @CurrentUser() user: any) {
    return this.bookingsService.exportToCsv(query, user);
  }
}
