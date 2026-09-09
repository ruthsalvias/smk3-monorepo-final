import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Siswa } from '../../models/SiswaModel';
import { SiswaService } from './siswa.service';
import { SiswaController } from './siswa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Siswa])],
  controllers: [SiswaController],
  providers: [SiswaService],
})
export class SiswaModule {}