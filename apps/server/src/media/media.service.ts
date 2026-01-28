import { Injectable } from '@nestjs/common';
import { Media } from './entities/media.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { FilesService } from '../files/files.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepository: Repository<Media>,
    private readonly fileService: FilesService,
  ) {}
  async createMediaForPost(postId: number, files: Express.Multer.File[]) {
    if (files && files.length > 0) {
      for (const file of files) {
        const fileEntity: any = await this.fileService.uploadToCloudinary(file);
        const newMedia = this.mediaRepository.create({
          post_id: postId,
          url: fileEntity.url,
          type: fileEntity.resource_type,
        });
        await this.mediaRepository.save(newMedia);
      }
    }
  }
}
