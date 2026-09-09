import { Injectable, NotFoundException } from '@nestjs/common';
import StatistikSekolahModel from '../../models/StatistikSekolahModel';
import { CreateStatistikDto, UpdateStatistikDto } from './statistik.dto';

@Injectable()
export class StatistikService {
  async findAll() {
    return await StatistikSekolahModel.findAll({
      order: [
        ['urutan', 'ASC'],
        ['created_at', 'ASC'],
      ],
    });
  }

  async findOne(id: string) {
    const data = await StatistikSekolahModel.findByPk(id);
    if (!data) throw new NotFoundException('Data statistik tidak ditemukan');
    return data;
  }

  async create(dto: CreateStatistikDto) {
    return await StatistikSekolahModel.create({ ...dto } as any);
  }

  async update(id: string, dto: UpdateStatistikDto) {
    const data = await this.findOne(id);
    return await data.update({ ...dto });
  }

  async remove(id: string) {
    const data = await this.findOne(id);
    await data.destroy();
    return { message: 'Data berhasil dihapus' };
  }
}
