import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSiswaDto {
  @IsNotEmpty({ message: 'namaLengkap is required' })
  @IsString()
  namaLengkap!: string;

  @IsOptional()
  @IsString()
  jurusan?: string;

  @IsNotEmpty({ message: 'nisn is required' })
  @IsString()
  nisn!: string;

  @IsOptional()
  @IsString()
  nis?: string;

  @IsNotEmpty({ message: 'kelas is required' })
  @IsString()
  kelas!: string;

  @IsOptional()
  @IsString()
  tanggalLahir?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  noWaOrtu?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  raporFile?: string;

  @IsOptional()
  @IsString()
  sklFile?: string;

  @IsOptional()
  @IsString()
  ijazahFile?: string;
}
