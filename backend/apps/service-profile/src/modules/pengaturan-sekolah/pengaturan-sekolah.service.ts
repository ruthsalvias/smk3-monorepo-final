import { Injectable } from '@nestjs/common';
import PengaturanSekolahModel from '../../models/PengaturanSekolahModel';
import { UpdatePengaturanSekolahDto } from './pengaturan-sekolah.dto';

/** Pengaturan sekolah bersifat singleton: selalu tepat satu baris. */
@Injectable()
export class PengaturanSekolahService {
  async find() {
    const existing = await PengaturanSekolahModel.findOne({
      order: [['created_at', 'ASC']],
    });
    if (existing) return existing;

    return await PengaturanSekolahModel.create({} as any);
  }

  async update(dto: UpdatePengaturanSekolahDto, logoUrl?: string) {
    const data = await this.find();
    const payload: Record<string, unknown> = { ...dto };
    if (logoUrl) payload.logo_url = logoUrl;
    return await data.update(payload);
  }
}
