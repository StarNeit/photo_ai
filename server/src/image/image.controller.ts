import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('transformations')
  getTransformations() {
    return {
      transformations: [
        { name: 'Younger', effect: 'younger', description: 'Make the person look younger, around 25 years old' },
        { name: 'Older', effect: 'older', description: 'Make the person look older, around 60 years old' },
        { name: 'Healthier', effect: 'healthier', description: 'Make the person look healthier with glowing skin' },
        { name: 'Thinner', effect: 'thinner', description: 'Make the person look slightly thinner while maintaining a natural appearance' }
      ]
    };
  }

  @Post('transform')
  @UseInterceptors(FileInterceptor('image', {
    storage: undefined,
    fileFilter: (req, file, callback) => {
      // Log the incoming file details for debugging
      console.log('Incoming file details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
        encoding: file.encoding,
        buffer: file.buffer ? 'Buffer exists' : 'No buffer'
      });

      // Check if the file has a valid image MIME type
      if (!file.mimetype || !file.mimetype.match(/^image\/(png|jpeg|jpg)$/)) {
        console.log('Invalid MIME type:', file.mimetype);
        return callback(new BadRequestException('Only PNG and JPEG images are allowed'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  async transformImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('transformation') transformation: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No image file provided');
      }

      if (!transformation) {
        throw new BadRequestException('No transformation specified');
      }

      // Log the file details before processing
      console.log('Processing file details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'Buffer exists' : 'No buffer',
        fieldname: file.fieldname,
        encoding: file.encoding
      });

      const transformedImageUrl = await this.imageService.transformImage(
        file.buffer,
        transformation,
        file.mimetype
      );
      return { url: transformedImageUrl };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error transforming image: ${error.message}`);
    }
  }
} 