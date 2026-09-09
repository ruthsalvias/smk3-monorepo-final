import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guru } from './guru.entity';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { AppException } from '../common/exception/app.exception';
import * as XLSX from 'xlsx';

@Injectable()
export class GuruService {
  constructor(
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
  ) {}

  // ===== BASIC LOGIC =====

  async create(dto: CreateGuruDto): Promise<Guru> {
    const guru = this.guruRepository.create({
      namaLengkap: dto.namaLengkap,
      nip: dto.nip,
      mataPelajaran: dto.mataPelajaran,
      jabatan: dto.jabatan || '',
      noTelepon: dto.noTelepon || '',
      anakWali: dto.anakWali || '',
      alamat: dto.alamat || '',
    });
    return this.guruRepository.save(guru);
  }

  async getAll(limit: number, offset: number): Promise<Guru[]> {
    return this.guruRepository.find({
      take: limit,
      skip: offset,
      order: { id: 'DESC' },
    });
  }

  async getById(id: string): Promise<Guru | null> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return null;
    }
    return this.guruRepository.findOneBy({ id: parsedId });
  }

  async update(id: string, dto: UpdateGuruDto): Promise<boolean> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return false;
    }
    const updateResult = await this.guruRepository.update(parsedId, {
      ...(dto.namaLengkap !== undefined && { namaLengkap: dto.namaLengkap }),
      ...(dto.nip !== undefined && { nip: dto.nip }),
      ...(dto.mataPelajaran !== undefined && { mataPelajaran: dto.mataPelajaran }),
      ...(dto.jabatan !== undefined && { jabatan: dto.jabatan }),
      ...(dto.noTelepon !== undefined && { noTelepon: dto.noTelepon }),
      ...(dto.anakWali !== undefined && { anakWali: dto.anakWali }),
      ...(dto.alamat !== undefined && { alamat: dto.alamat }),
    });
    return (updateResult.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return false;
    }
    const deleteResult = await this.guruRepository.delete(parsedId);
    return (deleteResult.affected ?? 0) > 0;
  }

  async getTotalGuru(): Promise<number> {
    return this.guruRepository.count();
  }

  async search(
    keyword: string | undefined,
    sortBy: string | undefined,
    order: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Guru[]> {
    const queryBuilder = this.guruRepository.createQueryBuilder('guru');

    if (keyword) {
      queryBuilder.where(
        'guru.namaLengkap LIKE :keyword OR guru.mataPelajaran LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    let sortCol = 'guru.id';
    let sortDir: 'ASC' | 'DESC' = 'DESC';

    if (sortBy === 'nama') {
      sortCol = 'guru.namaLengkap';
      sortDir = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    } else if (sortBy === 'nip') {
      sortCol = 'guru.nip';
      sortDir = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    } else if (sortBy === 'mapel') {
      sortCol = 'guru.mataPelajaran';
      sortDir = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    }

    queryBuilder.orderBy(sortCol, sortDir);
    queryBuilder.skip(offset).take(limit);

    return queryBuilder.getMany();
  }

  // ===== EXCEL IMPORT / EXPORT =====

  async importExcel(fileBuffer: Buffer): Promise<{ imported: number; skipped: number; errors: any[] }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let imported = 0;
    let skipped = 0;
    const errors: { row: string; reason: string }[] = [];

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const cell = (col: number) => {
        const val = row[col];
        if (val === undefined || val === null) return '';
        return String(val).trim();
      };

      const excelRowNumber = i + 1;

      const nip = cell(0);
      const namaLengkap = cell(1);
      const mataPelajaran = cell(2);
      const jabatan = cell(3);
      const noTelepon = cell(4);
      const anakWali = cell(5);
      const alamat = cell(6);

      // Skip headers, instructions, or title row
      if (
        nip.toLowerCase() === 'nip' ||
        nip.includes('TEMPLATE IMPORT') ||
        nip.includes('Jangan ubah') ||
        namaLengkap.toLowerCase() === 'nama lengkap'
      ) {
        continue;
      }

      if (!namaLengkap || !nip) {
        skipped++;
        errors.push({
          row: excelRowNumber.toString(),
          reason: 'Nama Lengkap atau NIP kosong',
        });
        continue;
      }

      try {
        const guru = this.guruRepository.create({
          namaLengkap,
          nip,
          mataPelajaran,
          jabatan,
          noTelepon,
          anakWali,
          alamat,
        });
        await this.guruRepository.save(guru);
        imported++;
      } catch (e) {
        skipped++;
        errors.push({
          row: excelRowNumber.toString(),
          reason: e.message || 'Gagal menyimpan ke database',
        });
      }
    }

    return { imported, skipped, errors };
  }

  async exportExcel(): Promise<Buffer> {
    const data = await this.guruRepository.find({
      order: { id: 'ASC' },
      take: 10000,
    });

    const worksheetData = [
      ['NIP', 'Nama Lengkap', 'Mata Pelajaran', 'Jabatan', 'No Telepon', 'Anak Wali', 'Alamat'],
    ];

    for (const guru of data) {
      worksheetData.push([
        guru.nip,
        guru.namaLengkap,
        guru.mataPelajaran,
        guru.jabatan,
        guru.noTelepon,
        guru.anakWali,
        guru.alamat,
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column width like sheet.setColumnWidth(0, 4000) in POI
    // In SheetJS: wch represents width in characters
    worksheet['!cols'] = [
      { wch: 18 }, // NIP
      { wch: 25 }, // Nama Lengkap
      { wch: 20 }, // Mata Pelajaran
      { wch: 15 }, // Jabatan
      { wch: 15 }, // No Telepon
      { wch: 20 }, // Anak Wali
      { wch: 30 }, // Alamat
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Guru');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
