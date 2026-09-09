import {
  IsString,
  IsOptional,
  IsDate,
  IsEnum,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ScheduleCategory } from '../entities';

const toBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });

const emptyToUndefined = () =>
  Transform(({ value }) => (value === '' || value === null ? undefined : value));

export class CreateScheduleDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @emptyToUndefined()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: 'Format waktu harus HH:mm',
  })
  startTime?: string;

  @IsOptional()
  @emptyToUndefined()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
    message: 'Format waktu harus HH:mm',
  })
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  participants?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsEnum(ScheduleCategory)
  category?: ScheduleCategory;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @emptyToUndefined()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
  startTime?: string;

  @IsOptional()
  @emptyToUndefined()
  @Matches(/^([0-1]\d|2[0-3]):[0-5]\d$/)
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  participants?: string;

  @IsOptional()
  @emptyToUndefined()
  @IsEnum(ScheduleCategory)
  category?: ScheduleCategory;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @toBoolean()
  @IsBoolean()
  isActive?: boolean;
}

export class ScheduleResponseDto {
  id: number;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  participants?: string;
  category: ScheduleCategory;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}