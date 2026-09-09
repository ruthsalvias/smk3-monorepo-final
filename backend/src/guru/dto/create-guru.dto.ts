import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateGuruDto {
  @IsNotEmpty({ message: 'namaLengkap is required' })
  @IsString()
  namaLengkap!: string;

  @IsNotEmpty({ message: 'nip is required' })
  @IsString()
  nip!: string;

  @IsOptional()
  @IsString()
  noTelepon?: string;

  @IsOptional()
  @IsString()
  anakWali?: string;

  @IsNotEmpty({ message: 'mataPelajaran is required' })
  @IsString()
  mataPelajaran!: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  jabatan?: string;
}
