import { IsNotEmpty, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

// Enum definito localmente per compatibilità (sync con Prisma schema)
export enum RejectionReason {
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  MAINTENANCE_SCHEDULED = 'MAINTENANCE_SCHEDULED',
  EVENT_ALREADY_BOOKED = 'EVENT_ALREADY_BOOKED',
  INSUFFICIENT_DOCUMENTATION = 'INSUFFICIENT_DOCUMENTATION',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  PAYMENT_ISSUES = 'PAYMENT_ISSUES',
  OTHER = 'OTHER',
}

export class RejectBookingDto {
  @IsNotEmpty({ message: 'Il motivo del rifiuto è obbligatorio' })
  @IsEnum(RejectionReason, { message: 'Motivo di rifiuto non valido' })
  reason!: RejectionReason;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Le note non possono superare i 500 caratteri' })
  additionalNotes?: string;
}

export const REJECTION_REASON_MESSAGES: Record<RejectionReason, string> = {
  [RejectionReason.RESOURCE_UNAVAILABLE]: 'La risorsa richiesta non è disponibile',
  [RejectionReason.MAINTENANCE_SCHEDULED]: 'È prevista una manutenzione programmata',
  [RejectionReason.EVENT_ALREADY_BOOKED]: 'Un altro evento è già stato prenotato',
  [RejectionReason.INSUFFICIENT_DOCUMENTATION]: 'Documentazione insufficiente',
  [RejectionReason.CAPACITY_EXCEEDED]: 'Capacità massima superata',
  [RejectionReason.PAYMENT_ISSUES]: 'Problemi con precedenti pagamenti',
  [RejectionReason.OTHER]: 'Altro motivo',
};
