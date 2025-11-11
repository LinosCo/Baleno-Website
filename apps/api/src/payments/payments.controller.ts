import { Controller, Post, Get, Body, Param, Headers, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.createPayment(createPaymentDto, user);
  }

  @Get('history')
  async getPaymentHistory(@CurrentUser() user: any) {
    return this.paymentsService.getPaymentHistory(user);
  }

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentsService.getReceipt(id, user);
  }

  @Get(':id/invoice/pdf')
  async downloadInvoice(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.paymentsService.generateInvoicePdf(id, user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="fattura-${id.substring(0, 8)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(HttpStatus.OK).end(pdfBuffer);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleStripeWebhook(body, signature);
  }
}
