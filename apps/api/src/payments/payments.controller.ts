import { Controller, Post, Get, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createPaymentIntent(@Body() createDto: any, @CurrentUser() user: any) {
    return this.paymentsService.createPaymentIntent(createDto, user);
  }

  @Post('confirm')
  async confirmPayment(@Body() confirmDto: any, @CurrentUser() user: any) {
    return this.paymentsService.confirmPayment(confirmDto, user);
  }

  @Post('refund')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async refundPayment(@Body() refundDto: any, @CurrentUser() user: any) {
    return this.paymentsService.refundPayment(refundDto, user);
  }

  @Get('history')
  async getPaymentHistory(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentHistory(user);
  }

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentsService.getReceipt(id, user);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleStripeWebhook(body, signature);
  }
}
