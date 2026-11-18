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
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImages', maxCount: 3 },
      { name: 'images', maxCount: 3 },
    ]),
  )
  create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.create(body, files);
  }

  @Get()
  findAll(
    @Query('projectType') projectType?: string,
    @Query('investor') investor?: string,
    @Query('completionTime') completionTime?: string,
    @Query('q') q?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findAll({
      projectType: projectType || type,
      investor,
      completionTime,
      q: q || search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImages', maxCount: 3 },
      { name: 'images', maxCount: 3 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.update(id, body, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
