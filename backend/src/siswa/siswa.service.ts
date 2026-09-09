import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Siswa } from './siswa.entity';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { AppException } from '../common/exception/app.exception';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

@Injectable()
export class SiswaService {
  constructor(
    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,
  ) {}

  // ===== BASIC LOGIC =====

  async create(dto: CreateSiswaDto): Promise<Siswa> {
    const siswa = this.siswaRepository.create({
      namaLengkap: dto.namaLengkap,
      jurusan: dto.jurusan || '',
      nisn: dto.nisn,
      nis: dto.nis || '',
      kelas: dto.kelas,
      tanggalLahir: dto.tanggalLahir || '',
      alamat: dto.alamat || '',
      noWaOrtu: dto.noWaOrtu || '',
      status: dto.status || 'aktif',
      raporFile: dto.raporFile || null,
      sklFile: dto.sklFile || null,
      ijazahFile: dto.ijazahFile || null,
    });
    return this.siswaRepository.save(siswa);
  }

  async getAll(limit: number, offset: number): Promise<Siswa[]> {
    return this.siswaRepository.find({
      take: limit,
      skip: offset,
      order: { id: 'DESC' },
    });
  }

  async getById(id: string): Promise<Siswa | null> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return null;
    }
    return this.siswaRepository.findOneBy({ id: parsedId });
  }

  async update(id: string, dto: UpdateSiswaDto): Promise<boolean> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return false;
    }
    const updateResult = await this.siswaRepository.update(parsedId, {
      ...(dto.namaLengkap !== undefined && { namaLengkap: dto.namaLengkap }),
      ...(dto.jurusan !== undefined && { jurusan: dto.jurusan }),
      ...(dto.nisn !== undefined && { nisn: dto.nisn }),
      ...(dto.nis !== undefined && { nis: dto.nis }),
      ...(dto.kelas !== undefined && { kelas: dto.kelas }),
      ...(dto.tanggalLahir !== undefined && { tanggalLahir: dto.tanggalLahir }),
      ...(dto.alamat !== undefined && { alamat: dto.alamat }),
      ...(dto.noWaOrtu !== undefined && { noWaOrtu: dto.noWaOrtu }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.raporFile !== undefined && { raporFile: dto.raporFile }),
      ...(dto.sklFile !== undefined && { sklFile: dto.sklFile }),
      ...(dto.ijazahFile !== undefined && { ijazahFile: dto.ijazahFile }),
    });
    return (updateResult.affected ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return false;
    }
    const deleteResult = await this.siswaRepository.delete(parsedId);
    return (deleteResult.affected ?? 0) > 0;
  }

  async search(
    keyword: string | undefined,
    sortBy: string | undefined,
    order: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Siswa[]> {
    const queryBuilder = this.siswaRepository.createQueryBuilder('siswa');

    if (keyword) {
      queryBuilder.where(
        'siswa.namaLengkap LIKE :keyword OR siswa.nisn LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    let sortCol = 'siswa.id';
    let sortDir: 'ASC' | 'DESC' = 'DESC';

    if (sortBy === 'nama') {
      sortCol = 'siswa.namaLengkap';
      sortDir = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    } else if (sortBy === 'nisn') {
      sortCol = 'siswa.nisn';
      sortDir = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    } else if (sortBy === 'kelas') {
      sortCol = 'siswa.kelas';
      sortDir = order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    }

    queryBuilder.orderBy(sortCol, sortDir);
    queryBuilder.skip(offset).take(limit);

    return queryBuilder.getMany();
  }

  // ===== STATS =====

  async getStats(): Promise<{ total: number; aktif: number; lulus: number }> {
    const total = await this.siswaRepository.count();
    const aktif = await this.siswaRepository.countBy({ status: 'aktif' });
    const lulus = await this.siswaRepository.countBy({ status: 'lulus' });

    return { total, aktif, lulus };
  }

  // ===== FILE MANAGEMENT =====

  async updateFile(id: string, type: string, filePath: string): Promise<boolean> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return false;
    }

    const fieldMap: Record<string, string> = {
      rapor: 'raporFile',
      skl: 'sklFile',
      ijazah: 'ijazahFile',
    };

    const field = fieldMap[type];
    if (!field) return false;

    const updateResult = await this.siswaRepository.update(parsedId, {
      [field]: filePath,
    });

    return (updateResult.affected ?? 0) > 0;
  }

  async getFilePath(id: string, type: string): Promise<string> {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new AppException(400, 'ID tidak valid');
    }

    const siswa = await this.siswaRepository.findOneBy({ id: parsedId });
    if (!siswa) {
      throw new AppException(404, 'Siswa tidak ditemukan');
    }

    let filePath: string | null = null;
    if (type === 'rapor') {
      filePath = siswa.raporFile;
    } else if (type === 'skl') {
      filePath = siswa.sklFile;
    } else if (type === 'ijazah') {
      filePath = siswa.ijazahFile;
    } else {
      throw new AppException(400, 'Tipe tidak valid. Gunakan: rapor, skl, atau ijazah');
    }

    if (!filePath) {
      throw new AppException(404, `File ${type} belum tersedia untuk siswa ini`);
    }

    return filePath;
  }

  // ===== EXCEL IMPORT / EXPORT =====

  async importExcel(fileBuffer: Buffer): Promise<{ imported: number; skipped: number }> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const cell = (col: number) => {
        const val = row[col];
        if (val === undefined || val === null) return '';
        return String(val).trim();
      };

      const nisn = cell(0);
      const nis = cell(1);
      const namaLengkap = cell(2);
      const kelas = cell(3);
      const jurusan = cell(4);
      const tanggalLahir = cell(5);
      const alamat = cell(6);
      const noWaOrtu = cell(7);
      const status = cell(8) || 'aktif';

      // Skip headers, instructions, or title row
      if (
        nisn.toLowerCase() === 'nisn' ||
        nisn.includes('TEMPLATE IMPORT') ||
        nisn.includes('Jangan ubah') ||
        namaLengkap.toLowerCase() === 'nama lengkap'
      ) {
        continue;
      }

      if (!namaLengkap || !nisn) {
        skipped++;
        continue;
      }

      try {
        const siswa = this.siswaRepository.create({
          namaLengkap,
          nisn,
          nis,
          kelas,
          jurusan,
          tanggalLahir,
          alamat,
          noWaOrtu,
          status,
        });
        await this.siswaRepository.save(siswa);
        imported++;
      } catch (e) {
        skipped++;
      }
    }

    return { imported, skipped };
  }

  async exportExcel(): Promise<Buffer> {
    const data = await this.siswaRepository.find({
      order: { id: 'ASC' },
      take: 10000,
    });

    const worksheetData = [
      ['NISN', 'Nama', 'Kelas', 'Jurusan', 'Status'],
    ];

    for (const siswa of data) {
      worksheetData.push([
        siswa.nisn,
        siswa.namaLengkap,
        siswa.kelas,
        siswa.jurusan,
        siswa.status,
      ]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = [
      { wch: 18 }, // NISN
      { wch: 25 }, // Nama
      { wch: 12 }, // Kelas
      { wch: 20 }, // Jurusan
      { wch: 12 }, // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
