import { Controller, Get } from '@nestjs/common';
import { CloudinaryAdapter } from '../files/adapters/cloudinary.adapter';

@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryAdapter: CloudinaryAdapter) {}

  @Get('cloudinary/signature')
  getSignature() {
    return this.cloudinaryAdapter.getSignature();
  }
}
