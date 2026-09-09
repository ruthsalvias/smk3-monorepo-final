import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnnouncementService } from '../services/announcement.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from '../dtos/announcement.dto';
import { imageUploadOptions, publicImageUrl } from '../common/upload.util';

const FOLDER = 'pengumuman';

@Controller('pengumuman')
export class PengumumanController {
  constructor(private readonly service: AnnouncementService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 100) {
    return await this.service.findAll(page, limit);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('gambar', imageUploadOptions(FOLDER)))
  async create(
    @Body() dto: CreateAnnouncementDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = publicImageUrl(FOLDER, file) ?? dto.imageUrl;
    return await this.service.create({ ...dto, imageUrl });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('gambar', imageUploadOptions(FOLDER)))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = publicImageUrl(FOLDER, file) ?? dto.imageUrl;
    return await this.service.update(id, { ...dto, imageUrl });
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return await this.service.toggleActive(id);
  }

  @Put(':id/toggle-pin')
  async togglePin(@Param('id', ParseIntPipe) id: number) {
    return await this.service.togglePin(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { message: 'Pengumuman dihapus' };
  }
}