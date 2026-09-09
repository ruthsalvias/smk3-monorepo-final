import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  Length,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AnnouncementType } from '../entities';

const toBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });

const emptyToUndefined = () =>
  Transform(({ value }) => (value === '' || value === null ? undefined : value));

export class CreateAnnouncementDto {
  @IsString()
  @Length(3, 255)
  title: string;

  @IsString()
  @Length(3)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @IsOptional()
  @emptyToUndefined()
  @Type(() => Date)
  @IsDate()
  expiredAt?: Date;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(3)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @IsOptional()
  @toBoolean()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @emptyToUndefined()
  @Type(() => Date)
  @IsDate()
  expiredAt?: Date;
}

export class AnnouncementResponseDto {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  author?: string;
  isActive: boolean;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}