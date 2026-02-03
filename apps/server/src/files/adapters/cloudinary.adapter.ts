import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';
@Injectable()
export class CloudinaryAdapter {
  constructor(
    @Inject('CLOUDINARY') private cloudinary: typeof v2,
    private readonly configService: ConfigService,
  ) {}
  async upload(file: Express.Multer.File) {
    const result = await this.cloudinary.uploader.upload(file.path, {
      folder: 'meThread',
      resource_type: 'auto',
    });
    return result;
  }
  getSignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'meThread';
    const signature = this.cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: folder,
      },
      this.configService.getOrThrow<string>('CLOUDINARY_SECRET_KEY'),
    );
    return { signature, timestamp, folder };
  }
}
