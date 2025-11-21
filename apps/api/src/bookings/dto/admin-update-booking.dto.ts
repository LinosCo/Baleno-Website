import { IsString, IsDateString, IsOptional } from 'class-validator';

export class AdminUpdateBookingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  adminNote?: string; // Nota interna admin sul motivo della modifica
}
