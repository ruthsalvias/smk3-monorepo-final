import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGuruDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  namaLengkap!: string;

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
