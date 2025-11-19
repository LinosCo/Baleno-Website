import { IsOptional, IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class ApproveBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customAmount?: number; // Importo personalizzato in euro (se fornito, sovrascrive il calcolo automatico)
}
