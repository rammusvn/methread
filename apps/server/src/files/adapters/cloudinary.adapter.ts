import { Inject, Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
@Injectable()
export class CloudinaryAdapter {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof v2) {}
  async upload(file: Express.Multer.File) {
    const result = await this.cloudinary.uploader.upload(file.path, {
      folder: 'meThread',
      resource_type: 'auto',
    });
    return result;
  }
}
