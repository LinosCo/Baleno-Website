import { Controller, Get, Put, Param, UseGuards, Logger } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('admin/bank-transfers')
@UseGuards(RolesGuard)
export class BankTransfersController {
  private readonly logger = new Logger(BankTransfersController.name);

  constructor(
    private paymentsService: PaymentsService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async getPendingTransfers() {
    return this.paymentsService.getPendingBankTransfers();
  }

  @Put(':paymentId/verify')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async verifyTransfer(
    @Param('paymentId') paymentId: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.paymentsService.verifyBankTransfer(paymentId, user.id);

    // Log audit
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'APPROVE' as any,
      entity: 'payment',
      entityId: paymentId,
      description: `Bonifico bancario verificato - Codice: ${result.bankTransferCode}`,
      metadata: {
        paymentId,
        bankTransferCode: result.bankTransferCode,
        amount: Number(result.amount),
      },
    });

    this.logger.log(`Bank transfer ${paymentId} verified by ${user.email}`);

    return {
      success: true,
      payment: result,
      message: 'Bank transfer verified successfully',
    };
  }
}
