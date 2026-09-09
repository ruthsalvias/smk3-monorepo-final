import {
  Controller, Get, Put, Post,
  Body, UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PengaturanSekolahService } from './pengaturan-sekolah.service';
import { UpdatePengaturanSekolahDto } from './pengaturan-sekolah.dto';
import { normalizePath } from '../../../../../libs/common/src/utils/toolsUtil';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/pengaturan',
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg\+xml)$/)) {
      return cb(new BadRequestException('Hanya file gambar yang diperbolehkan'), false);
    }
    cb(null, true);
  },
};

@Controller('pengaturan-sekolah')
export class PengaturanSekolahController {
  constructor(private readonly service: PengaturanSekolahService) {}

  @Get()
  find() {
    return this.service.find();
  }

  @Put()
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  update(
    @Body() dto: UpdatePengaturanSekolahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const logoUrl = file
      ? normalizePath(file.path).replace(/^uploads[/\\]/, '')
      : undefined;
    return this.service.update(dto, logoUrl);
  }

  // alias agar klien yang hanya bisa POST tetap dapat menyimpan
  @Post()
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  save(
    @Body() dto: UpdatePengaturanSekolahDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.update(dto, file);
  }
}
