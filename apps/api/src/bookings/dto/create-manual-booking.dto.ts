import { IsString, IsDateString, IsOptional, IsInt, Min, IsNotEmpty, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { AdditionalResourceDto } from './create-booking.dto';

/**
 * DTO per la creazione di prenotazioni manuali da parte dell'admin
 * Permette di creare una prenotazione senza richiedere un account utente registrato
 */
export class CreateManualBookingDto {
  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  attendees?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  // Dati dell'ospite (per prenotazioni senza account)
  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalResourceDto)
  @IsOptional()
  additionalResources?: AdditionalResourceDto[];

  // Stato iniziale della prenotazione (l'admin può scegliere se approvarla subito)
  @IsOptional()
  autoApprove?: boolean;
}
