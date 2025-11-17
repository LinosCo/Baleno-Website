import { IsBoolean, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdatePaymentSettingsDto {
  // Stripe Settings
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

  // Bank Transfer Settings
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
  @IsNumber()
  @Min(1)
  @Max(30)
  paymentDeadlineDays?: number;

  // General Settings
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
  @IsNumber()
  @Min(1)
  invoiceStartNumber?: number;

  // Email Settings
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  paymentReminderHours?: number;

  @IsOptional()
  @IsBoolean()
  sendReminders?: boolean;
}
