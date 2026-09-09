import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guru } from '../../models/GuruModel';
import { GuruService } from './guru.service';
import { GuruController } from './guru.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guru])],
  controllers: [GuruController],
  providers: [GuruService],
})
export class GuruModule {}