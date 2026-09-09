import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { NewsService } from '../services/news.service';
import { CreateNewsDto, UpdateNewsDto } from '../dtos/news.dto';
import { imageUploadOptions, publicImageUrl } from '../common/upload.util';

const FOLDER = 'berita';

@Controller('berita')
export class BeritaController {
  constructor(private newsService: NewsService) {}

  // 🔓 semua role boleh baca
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.newsService.findAll(page, limit);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.newsService.incrementViews(id);
  }

  // 🔥 hanya ADMIN boleh create
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('gambar', imageUploadOptions(FOLDER)))
  async create(
    @Body() body: CreateNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = publicImageUrl(FOLDER, file) ?? body.imageUrl;
    return await this.newsService.create({ ...body, imageUrl });
  }

  // 🔥 ADMIN + GURU boleh update
  @Put(':id')
  @UseInterceptors(FileInterceptor('gambar', imageUploadOptions(FOLDER)))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNewsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = publicImageUrl(FOLDER, file) ?? body.imageUrl;
    return await this.newsService.update(id, { ...body, imageUrl });
  }

  @Put(':id/toggle-pin')
  async togglePin(@Param('id', ParseIntPipe) id: number) {
    return await this.newsService.togglePin(id);
  }

  // 🔥 hanya ADMIN boleh delete
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.newsService.delete(id);
  }
}
