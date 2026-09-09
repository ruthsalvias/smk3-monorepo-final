import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import { SiswaService } from './siswa.service';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { AppException } from '../common/exception/app.exception';
import * as fs from 'fs';

@Controller('siswa')
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Get()
  async getAll(
    @Query('limit') limitQuery?: string,
    @Query('offset') offsetQuery?: string,
  ) {
    const limit = limitQuery ? parseInt(limitQuery, 10) : 10;
    const offset = offsetQuery ? parseInt(offsetQuery, 10) : 0;

    const siswaList = await this.siswaService.getAll(limit, offset);
    const hasMore = siswaList.length === limit;

    const siswaWithMeta = siswaList.map((siswa) => ({
      id: String(siswa.id),
      namaLengkap: siswa.namaLengkap,
      jurusan: siswa.jurusan,
      nisn: siswa.nisn,
      nis: siswa.nis,
      kelas: siswa.kelas,
      tanggalLahir: siswa.tanggalLahir,
      alamat: siswa.alamat,
      noWaOrtu: siswa.noWaOrtu,
      status: siswa.status,
      raporFile: siswa.raporFile,
      sklFile: siswa.sklFile,
      ijazahFile: siswa.ijazahFile,
    }));

    return {
      status: 'success',
      message: 'Berhasil mengambil data siswa',
      data: {
        siswa: siswaWithMeta,
        limit,
        offset,
        hasMore,
      },
    };
  }

  @Get('search')
  async search(
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
    @Query('limit') limitQuery?: string,
    @Query('offset') offsetQuery?: string,
  ) {
    const limit = limitQuery ? parseInt(limitQuery, 10) : 10;
    const offset = offsetQuery ? parseInt(offsetQuery, 10) : 0;
    const resolvedOrder = order || 'desc';

    const siswaList = await this.siswaService.search(
      keyword,
      sortBy,
      resolvedOrder,
      limit,
      offset,
    );

    const siswaWithMeta = siswaList.map((siswa) => ({
      id: String(siswa.id),
      namaLengkap: siswa.namaLengkap,
      jurusan: siswa.jurusan,
      nisn: siswa.nisn,
      nis: siswa.nis,
      kelas: siswa.kelas,
      tanggalLahir: siswa.tanggalLahir,
      alamat: siswa.alamat,
      noWaOrtu: siswa.noWaOrtu,
      status: siswa.status,
      raporFile: siswa.raporFile,
      sklFile: siswa.sklFile,
      ijazahFile: siswa.ijazahFile,
    }));

    return {
      status: 'success',
      message: 'Berhasil mencari data',
      data: {
        siswa: siswaWithMeta,
      },
    };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.siswaService.getStats();
    return {
      status: 'success',
      message: 'Berhasil ambil statistik',
      data: stats,
    };
  }

  @Get('export')
  async exportExcel(@Res() res: express.Response) {
    const buffer = await this.siswaService.exportExcel();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="data_siswa.xlsx"');
    res.send(buffer);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const siswa = await this.siswaService.getById(id);
    if (!siswa) {
      throw new AppException(404, 'Siswa tidak ditemukan');
    }
    return {
      status: 'success',
      message: 'Berhasil mengambil data',
      data: {
        siswa,
      },
    };
  }

  @Post()
  async post(@Body() dto: CreateSiswaDto) {
    const siswa = await this.siswaService.create(dto);
    return {
      status: 'success',
      message: 'Berhasil menambah siswa',
      data: {
        siswa,
      },
    };
  }

  @Put(':id')
  async put(@Param('id') id: string, @Body() dto: UpdateSiswaDto) {
    const isUpdated = await this.siswaService.update(id, dto);
    if (!isUpdated) {
      throw new AppException(400, 'Gagal update siswa');
    }
    return {
      status: 'success',
      message: 'Berhasil mengubah data',
      data: {
        message: 'Siswa berhasil diupdate',
      },
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const isDeleted = await this.siswaService.delete(id);
    if (!isDeleted) {
      throw new AppException(400, 'Gagal delete siswa');
    }
    return {
      status: 'success',
      message: 'Berhasil menghapus data',
      data: {
        message: 'Siswa berhasil dihapus',
      },
    };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new AppException(400, 'File tidak ditemukan');
    }
    const result = await this.siswaService.importExcel(file.buffer);
    return {
      status: 'success',
      message: 'Import selesai',
      data: result,
    };
  }

  @Post(':id/upload/:type')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: string,
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (type !== 'rapor' && type !== 'skl' && type !== 'ijazah') {
      throw new AppException(400, 'Tipe file tidak valid. Gunakan: rapor, skl, ijazah');
    }

    if (!file) {
      throw new AppException(400, 'File tidak ditemukan dalam request');
    }

    const originalName = file.originalname || 'file.pdf';
    const ext = originalName.split('.').pop() || 'pdf';

    if (ext.toLowerCase() !== 'pdf') {
      throw new AppException(400, 'Hanya file PDF yang diperbolehkan');
    }

    const fileName = `${type}_${id}_${Date.now()}.${ext}`;
    const uploadDir = 'uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = `${uploadDir}/${fileName}`;
    fs.writeFileSync(filePath, file.buffer);

    const success = await this.siswaService.updateFile(id, type, filePath);
    if (!success) {
      throw new AppException(404, 'Siswa tidak ditemukan');
    }

    return {
      status: 'success',
      message: 'File berhasil diupload',
      path: filePath,
    };
  }

  @Get(':id/download/:type')
  async download(
    @Param('id') id: string,
    @Param('type') type: string,
    @Res() res: express.Response,
  ) {
    const filePath = await this.siswaService.getFilePath(id, type);
    if (!fs.existsSync(filePath)) {
      throw new AppException(404, 'File tidak ditemukan di server');
    }
    res.download(filePath);
  }
}
