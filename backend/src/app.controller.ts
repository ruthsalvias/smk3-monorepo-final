import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'API Sistem Informasi SMKN 3 Balige Berjalan';
  }
}
