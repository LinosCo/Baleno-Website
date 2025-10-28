import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('reports')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bookings')
  async getBookingsReport(@Query() query: any) {
    return this.reportsService.getBookingsReport(query);
  }

  @Get('revenue')
  async getRevenueReport(@Query() query: any) {
    return this.reportsService.getRevenueReport(query);
  }

  @Get('users')
  async getUsersReport() {
    return this.reportsService.getUsersReport();
  }

  @Get('resources')
  async getResourcesReport() {
    return this.reportsService.getResourcesReport();
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }
}
