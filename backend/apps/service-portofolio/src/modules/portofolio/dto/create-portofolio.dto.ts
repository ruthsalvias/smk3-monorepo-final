import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';


const JURUSAN_OPTIONS = ['Tataboga', 'Perhotelan'];

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul karya wajib diisi' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi wajib diisi' })
  description: string;

  @IsString()
  @IsOptional()
  studentName?: string;

  @IsString()
  @IsOptional()
  @IsIn(JURUSAN_OPTIONS, { message: 'Jurusan tidak valid' })
  major?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  skill?: string;

  @IsString()
  @IsOptional()
  image?: string; // Menerima string Base64 dari FE
}