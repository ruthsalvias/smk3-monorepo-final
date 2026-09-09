import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guru } from './models/GuruModel';
import { Siswa } from './models/SiswaModel';
import { GuruModule } from './modules/guru/guru.module';
import { SiswaModule } from './modules/siswa/siswa.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Docker DNS internal database management Anda: db_management
      host: process.env.DB_HOST || 'db_management',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres_pass',
      database: 'db_management',
      entities: [Guru, Siswa],
      synchronize: true, // Matikan atau ganti false jika di production (gunakan migrasi)
    }),
    GuruModule,
    SiswaModule,
  ],
})
export class AppModule {}