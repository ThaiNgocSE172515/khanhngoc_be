import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MembersService } from './members.service.js';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createMemberDto: CreateMemberDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.membersService.create(createMemberDto, file);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.membersService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.membersService.update(id, updateMemberDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}