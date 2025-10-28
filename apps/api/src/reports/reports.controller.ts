import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

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
  async getUsersReport(@Query() query: any) {
    return this.reportsService.getUsersReport(query);
  }

  @Get('resources')
  async getResourcesReport(@Query() query: any) {
    return this.reportsService.getResourcesReport(query);
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }
}
