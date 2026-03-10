import { Injectable } from '@nestjs/common';
import { SavedPost } from './entities/save.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SaveService {
  constructor(
    @InjectRepository(SavedPost)
    private savedPostRepository: Repository<SavedPost>,
  ) {}
  async isSaved(postId: number, userId: number) {
    const savedPost = await this.savedPostRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });
    return savedPost?.is_saved;
  }

  async toggle(postId: number, userId: number) {
    const savedPost = await this.savedPostRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });
    if (savedPost) {
      savedPost.is_saved = !savedPost.is_saved;
      await this.savedPostRepository.save(savedPost);
    } else {
      const newSavedPost = this.savedPostRepository.create({
        post_id: postId,
        user_id: userId,
        is_saved: true,
      });
      await this.savedPostRepository.save(newSavedPost);
    }
  }
}
