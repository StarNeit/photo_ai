import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/images/edits';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async transformImage(imageBuffer: Buffer, transformation: string, mimeType: string): Promise<string> {
    try {
      // Validate transformation
      const prompts: Record<string, string> = {
        younger: 'Make the person look younger, around 25 years old, professional look, smooth skin, no gray hair',
        older: 'Make the person look older, around 60 years old, with some wrinkles and gray hair',
        healthier: 'Make the person look healthier, with glowing skin, bright eyes, and a healthy complexion',
        thinner: 'Make the person look slightly thinner while maintaining a natural appearance',
      };

      const prompt = prompts[transformation];
      if (!prompt) {
        throw new Error(`Invalid transformation type: "${transformation}"`);
      }

      // Ensure temp directory exists
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Generate unique filenames
      const uniqueId = uuidv4();
      const tempImagePath = path.join(tempDir, `image_${uniqueId}.png`);
      const tempMaskPath = path.join(tempDir, `mask_${uniqueId}.png`);

      // Process image to meet OpenAI requirements
      const processedImage = await sharp(imageBuffer)
        .resize(1024, 1024, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer();

      // Check if the processed image is too large
      if (processedImage.length > 4 * 1024 * 1024) {
        throw new Error('Processed image is too large (max 4MB)');
      }

      // Save processed image to disk
      fs.writeFileSync(tempImagePath, processedImage);

      // Create a white mask with black areas for editing
      const mask = await sharp({
        create: {
          width: 1024,
          height: 1024,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite([{
          input: Buffer.from([0, 0, 0, 255]),
          raw: {
            width: 1,
            height: 1,
            channels: 4
          },
          tile: true,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      fs.writeFileSync(tempMaskPath, mask);

      // Prepare form data
      const formData = new FormData();
      formData.append('image', fs.createReadStream(tempImagePath), {
        filename: 'image.png',
        contentType: 'image/png',
      });
      formData.append('mask', fs.createReadStream(tempMaskPath), {
        filename: 'mask.png',
        contentType: 'image/png',
      });
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('size', '1024x1024');
      formData.append('response_format', 'url');

      // Make API request
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      // Cleanup
      fs.unlinkSync(tempImagePath);
      fs.unlinkSync(tempMaskPath);

      if (!response.data?.data?.[0]?.url) {
        throw new Error('Invalid response from OpenAI API');
      }

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error in transformImage:', error.message);
      if (error.response?.data) {
        console.error('OpenAI API Response:', error.response.data);
      }
      throw new InternalServerErrorException(
        error.response?.data?.error?.message || 
        error.message || 
        'Failed to transform image'
      );
    }
  }
}
