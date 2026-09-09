import { IsString, IsOptional } from 'class-validator';

export class UpdateGuruDto {
  @IsOptional()
  @IsString()
  namaLengkap?: string;

  @IsOptional()
  @IsString()
  nip?: string;

  @IsOptional()
  @IsString()
  noTelepon?: string;

  @IsOptional()
  @IsString()
  anakWali?: string;

  @IsOptional()
  @IsString()
  mataPelajaran?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  jabatan?: string;
}
