import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  bookingId!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
