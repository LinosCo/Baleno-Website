import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PdfService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
