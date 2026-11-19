import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HiringService } from './hiring.service.js';
import { CreateHiringDto } from './dto/create-hiring.dto.js';
import { UpdateHiringDto } from './dto/update-hiring.dto.js';
import { FindHiringQueryDto } from './dto/find-hiring-query.dto.js';

@Controller('hiring')
export class HiringController {
  constructor(private readonly hiringService: HiringService) {}

  @Post()
  create(@Body() createHiringDto: CreateHiringDto) {
    return this.hiringService.create(createHiringDto);
  }

  @Get()
  findAll(@Query() query: FindHiringQueryDto) {
    return this.hiringService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('lang') lang?: 'vi' | 'en') {
    return this.hiringService.findOne(id, lang);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHiringDto: UpdateHiringDto) {
    return this.hiringService.update(id, updateHiringDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hiringService.remove(id);
  }
}