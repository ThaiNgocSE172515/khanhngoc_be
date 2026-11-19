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
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { FindProjectsQueryDto } from './dto/find-projects-query.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImages', maxCount: 3 },
      { name: 'images', maxCount: 15 },
    ]),
  )
  create(
    @Body() body: CreateProjectDto,
    @UploadedFiles()
    files: {
      mainImages?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.projectsService.create(body, files);
  }

  @Get()
  findAll(@Query() query: FindProjectsQueryDto) {
    return this.projectsService.findAll({
      projectType: query.projectType || query.type,
      investor: query.investor,
      completionTime: query.completionTime,
      q: query.q || query.search,
      page: query.page,
      limit: query.limit,
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
      { name: 'images', maxCount: 15 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
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