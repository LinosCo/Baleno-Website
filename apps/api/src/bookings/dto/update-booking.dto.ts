import { IsString, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateBookingDto {
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

  @IsInt()
  @Min(1)
  @IsOptional()
  attendees?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
