import { Injectable } from '@nestjs/common';
import { Media } from './entities/media.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepository: Repository<Media>,
  ) {}
  async createMediaForPost(postId: number, media: string[]) {
    if (media && media.length > 0) {
      for (const url of media) {
        const newMedia = this.mediaRepository.create({
          post_id: postId,
          url: url,
          type: url.includes('image') ? 'image' : 'video',
        });
        await this.mediaRepository.save(newMedia);
      }
    }
  }
}
