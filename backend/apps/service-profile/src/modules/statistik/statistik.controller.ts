import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { StatistikService } from './statistik.service';
import { CreateStatistikDto, UpdateStatistikDto } from './statistik.dto';

@Controller('statistik')
export class StatistikController {
  constructor(private readonly service: StatistikService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStatistikDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStatistikDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
