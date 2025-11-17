import { Module } from '@nestjs/common';
import { PaymentSettingsController } from './payment-settings.controller';
import { BankTransfersController } from './bank-transfers.controller';
import { PaymentsModule } from '../payments/payments.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PaymentsModule, AuditLogsModule],
  controllers: [PaymentSettingsController, BankTransfersController],
})
export class AdminModule {}
