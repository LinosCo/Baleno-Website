import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
