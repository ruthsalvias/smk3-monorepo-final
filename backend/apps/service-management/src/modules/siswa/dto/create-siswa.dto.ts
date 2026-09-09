import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSiswaDto {
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  namaLengkap!: string;

  @IsOptional()
  @IsString()
  jurusan?: string;

  @IsOptional()
  @IsString()
  nisn?: string;

  @IsOptional()
  @IsString()
  nis?: string;

  @IsOptional()
  @IsString()
  kelas?: string;

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
  @IsIn(['aktif', 'lulus', 'pindah', 'keluar'])
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
