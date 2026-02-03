import { LoggerService } from '@app/common/logger/my-logger.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostsService } from '../posts.service';

@Injectable()
export class PostRanking {
  constructor(
    private readonly logger: LoggerService,
    private readonly postService: PostsService,
  ) {
    this.logger.setContext(PostRanking.name);
  }
  @Cron('0 */15 * * * *')
  async calculateScore() {
    await this.postService.updatePostScores();
    this.logger.debug('calculated score');
  }
}
