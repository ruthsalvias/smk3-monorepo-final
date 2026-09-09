import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScheduleService } from '../services/schedule.service';
import { CreateScheduleDto, UpdateScheduleDto } from '../dtos/schedule.dto';
import { ScheduleCategory } from '../entities/schedule.entity';
import { imageUploadOptions, publicImageUrl } from '../common/upload.util';

const FOLDER = 'agenda';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 100,
    @Query('category') category?: ScheduleCategory,
  ) {
    const result = await this.scheduleService.findAll(page, limit, category);
    return result;
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.scheduleService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('gambar', imageUploadOptions(FOLDER)))
  async create(
    @Body() dto: CreateScheduleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = publicImageUrl(FOLDER, file) ?? dto.imageUrl;
    return await this.scheduleService.create({ ...dto, imageUrl });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('gambar', imageUploadOptions(FOLDER)))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = publicImageUrl(FOLDER, file) ?? dto.imageUrl;
    return await this.scheduleService.update(id, { ...dto, imageUrl });
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return await this.scheduleService.toggleActive(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleService.remove(id);
    return { message: 'Agenda berhasil dihapus' };
  }
}