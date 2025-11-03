import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ResourceType)
  type!: ResourceType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsNumber()
  @Min(0)
  pricePerHour!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsString()
  @IsOptional()
  rules?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
