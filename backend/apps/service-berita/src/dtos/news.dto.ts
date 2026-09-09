import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** form-data selalu mengirim string, jadi "true"/"1" harus dinormalkan. */
const toBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });

export class CreateNewsDto {
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
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @toBoolean()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateNewsDto {
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
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @toBoolean()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @toBoolean()
  @IsBoolean()
  isActive?: boolean;
}

export class NewsResponseDto {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  imageUrl?: string;
  author?: string;
  views: number;
  isFeatured: boolean;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}