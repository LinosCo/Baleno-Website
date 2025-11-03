import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CheckAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}
