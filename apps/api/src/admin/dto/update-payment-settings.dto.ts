import { IsBoolean, IsOptional, IsString, IsNumber, IsInt, Min, Max } from 'class-validator';

export class UpdatePaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @IsOptional()
  @IsString()
  stripePublishableKey?: string;

  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;

  @IsOptional()
  @IsBoolean()
  bankTransferEnabled?: boolean;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountHolder?: string;

  @IsOptional()
  @IsString()
  bankIBAN?: string;

  @IsOptional()
  @IsString()
  bankBIC?: string;

  @IsOptional()
  @IsString()
  bankAddress?: string;

  @IsOptional()
  @IsString()
  bankTransferNote?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  paymentDeadlineDays?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  invoiceStartNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  currentInvoiceNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  paymentReminderHours?: number;

  @IsOptional()
  @IsBoolean()
  sendReminders?: boolean;
}
