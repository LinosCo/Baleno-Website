import { IsString, IsOptional } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
