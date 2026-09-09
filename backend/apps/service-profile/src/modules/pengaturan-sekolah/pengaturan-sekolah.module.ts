import { Module } from '@nestjs/common';
import { PengaturanSekolahController } from './pengaturan-sekolah.controller';
import { PengaturanSekolahService } from './pengaturan-sekolah.service';

@Module({
  controllers: [PengaturanSekolahController],
  providers: [PengaturanSekolahService],
})
export class PengaturanSekolahModule {}
