import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getApiInfo() {
    return {
      name: 'Baleno Booking System API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        bookings: '/api/bookings',
        payments: '/api/payments',
        resources: '/api/resources',
        reports: '/api/reports',
      },
    };
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
