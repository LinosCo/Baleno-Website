import { IsString, IsDateString, IsOptional, IsInt, Min, IsNotEmpty, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AdditionalResourceDto {
  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

export class CreateBookingDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalResourceDto)
  @IsOptional()
  additionalResources?: AdditionalResourceDto[];

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
