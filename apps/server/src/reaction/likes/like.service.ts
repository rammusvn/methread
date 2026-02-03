import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
  ) {}
  async toggle(postId: number, userId: number): Promise<number> {
    const like = await this.likeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });
    if (like) {
      const isLike = like.is_like;
      like.is_like = !isLike;
      await this.likeRepository.save(like);
      if (!isLike) {
        return 1;
      }
      return -1;
    } else {
      const createdLike = this.likeRepository.create({
        user_id: userId,
        post_id: postId,
      });
      await this.likeRepository.save(createdLike);
      return 1;
    }
  }

  async isLike(postId: number, userId: number) {
    const like = await this.likeRepository.findOne({
      where: { post_id: postId, user_id: userId },
    });
    if (like) {
      return like.is_like;
    }
    return false;
  }
}
