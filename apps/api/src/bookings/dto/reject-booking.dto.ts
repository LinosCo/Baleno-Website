import { IsString, IsNotEmpty } from 'class-validator';

export class RejectBookingDto {
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}
