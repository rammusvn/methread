import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FilesModule } from '../files/files.module';
import { MediaModule } from '../media/media.module';
import { ReactionModule } from '../reaction/reaction.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'apps/constants';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [
    TypeOrmModule.forFeature([Post]),
    FilesModule,
    MediaModule,
    ReactionModule,
    BullModule.registerQueue({
      name: QUEUES.NOTIFICATION_QUEUE,
    }),
  ],
})
export class PostsModule {}
