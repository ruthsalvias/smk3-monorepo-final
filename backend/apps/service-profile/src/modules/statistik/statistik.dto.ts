import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStatistikDto {
  @IsString()
  @MaxLength(100)
  label: string;

  @IsString()
  @MaxLength(50)
  nilai: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ikon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  urutan?: number;
}

export class UpdateStatistikDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nilai?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ikon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  urutan?: number;
}
