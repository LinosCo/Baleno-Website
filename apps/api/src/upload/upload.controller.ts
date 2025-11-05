import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('upload')
@UseGuards(RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @Post('images')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const urls = await this.uploadService.uploadMultipleImages(files);
    return { urls };
  }

  @Delete('image')
  @Roles(UserRole.ADMIN, UserRole.COMMUNITY_MANAGER)
  async deleteImage(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('No URL provided');
    }

    await this.uploadService.deleteImage(url);
    return { message: 'Image deleted successfully' };
  }
}
