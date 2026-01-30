import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean, Min, IsDate } from 'class-validator';
import { ResourceType, ResourceCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateResourceDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ResourceType)
  type!: ResourceType;

  @IsEnum(ResourceCategory)
  @IsOptional()
  category?: ResourceCategory;

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsNumber()
  @Min(0)
  pricePerHour!: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  minBookingHours?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number; // Prezzo minimo totale (es. 160€ per compleanni adulti)

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  maintenanceMode?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  maintenanceStart?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  maintenanceEnd?: Date;

  @IsString()
  @IsOptional()
  maintenanceReason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  rules?: string;

  @IsString()
  @IsOptional()
  restrictions?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsBoolean()
  @IsOptional()
  wheelchairAccessible?: boolean;
}
