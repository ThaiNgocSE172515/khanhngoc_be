import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AppsService } from './apps.service.js';
import { CreateAppDto } from './dto/create-app.dto.js';
import { UpdateAppDto } from './dto/update-app.dto.js';

// Cho phép file ứng dụng tối đa 500MB, ảnh tối đa 10MB
const MAX_UPLOAD_SIZE = 500 * 1024 * 1024;

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'appFile', maxCount: 1 },
        { name: 'icon', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: MAX_UPLOAD_SIZE },
      },
    ),
  )
  create(
    @Body() body: CreateAppDto,
    @UploadedFiles()
    files: {
      appFile?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    },
  ) {
    return this.appsService.create(body, files);
  }

  @Get()
  findAll(@Query() query: { q?: string; page?: string; limit?: string }) {
    return this.appsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.appsService.findOne(id);
    return { ...item, fileSize: Number(item.fileSize) };
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'appFile', maxCount: 1 },
        { name: 'icon', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: MAX_UPLOAD_SIZE },
      },
    ),
  )
  update(
    @Param('id') id: string,
    @Body() body: UpdateAppDto,
    @UploadedFiles()
    files: {
      appFile?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    },
  ) {
    return this.appsService.update(id, body, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appsService.remove(id);
  }
}