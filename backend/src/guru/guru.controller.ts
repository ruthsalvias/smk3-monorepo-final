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
import { GuruService } from './guru.service';
import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { AppException } from '../common/exception/app.exception';

@Controller('guru')
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Get()
  async getAll(
    @Query('limit') limitQuery?: string,
    @Query('offset') offsetQuery?: string,
  ) {
    const limit = limitQuery ? parseInt(limitQuery, 10) : 10;
    const offset = offsetQuery ? parseInt(offsetQuery, 10) : 0;

    const guruList = await this.guruService.getAll(limit, offset);
    const hasMore = guruList.length === limit;

    return {
      status: 'success',
      message: 'Berhasil mengambil data guru',
      data: {
        guru: guruList,
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

    const guruList = await this.guruService.search(
      keyword,
      sortBy,
      resolvedOrder,
      limit,
      offset,
    );

    return {
      status: 'success',
      message: 'Berhasil mencari data',
      data: {
        guru: guruList,
      },
    };
  }

  @Get('total')
  async getTotal() {
    const total = await this.guruService.getTotalGuru();
    return {
      status: 'success',
      message: 'Berhasil mengambil total guru',
      data: {
        total,
      },
    };
  }

  @Get('export')
  async exportExcel(@Res() res: express.Response) {
    const buffer = await this.guruService.exportExcel();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="data_guru.xlsx"');
    res.send(buffer);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const guru = await this.guruService.getById(id);
    if (!guru) {
      throw new AppException(404, 'Guru tidak ditemukan');
    }
    return {
      status: 'success',
      message: 'Berhasil mengambil data',
      data: {
        guru,
      },
    };
  }

  @Post()
  async post(@Body() dto: CreateGuruDto) {
    const guru = await this.guruService.create(dto);
    return {
      status: 'success',
      message: 'Berhasil menambah guru',
      data: {
        guru,
      },
    };
  }

  @Put(':id')
  async put(@Param('id') id: string, @Body() dto: UpdateGuruDto) {
    const isUpdated = await this.guruService.update(id, dto);
    if (!isUpdated) {
      throw new AppException(400, 'Gagal update guru');
    }
    return {
      status: 'success',
      message: 'Berhasil mengubah data',
      data: {
        message: 'Guru berhasil diupdate',
      },
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const isDeleted = await this.guruService.delete(id);
    if (!isDeleted) {
      throw new AppException(400, 'Gagal delete guru');
    }
    return {
      status: 'success',
      message: 'Berhasil menghapus data',
      data: {
        message: 'Guru berhasil dihapus',
      },
    };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new AppException(400, 'File tidak ditemukan');
    }
    const result = await this.guruService.importExcel(file.buffer);
    return {
      status: 'success',
      message: 'Import selesai',
      data: result,
    };
  }
}
