import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const JURUSAN_OPTIONS = ['Tataboga', 'Perhotelan'];

export class QueryPortfolioDto {
  @IsOptional()
  @IsString()
  @IsIn(JURUSAN_OPTIONS, { message: 'Jurusan tidak valid' })
  major?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  search?: string; 

  @IsOptional()
  @IsString()
  ownerUserId?: string; // Ditambahkan tipe data string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}