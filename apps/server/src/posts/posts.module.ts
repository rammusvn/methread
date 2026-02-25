import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FilesModule } from '../files/files.module';
import { ReactionModule } from '../reaction/reaction.module';
import { PostRanking } from './tasks/post-ranking.task';
import { QueueModule } from '@app/common/queue/queue.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostRanking],
  imports: [
    TypeOrmModule.forFeature([Post]),
    FilesModule,
    ReactionModule,
    QueueModule,
  ],
})
export class PostsModule {}
