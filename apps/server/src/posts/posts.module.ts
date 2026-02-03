import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FilesModule } from '../files/files.module';
import { ReactionModule } from '../reaction/reaction.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'apps/constants';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PostRanking } from './tasks/post-ranking.task';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostRanking],
  imports: [
    TypeOrmModule.forFeature([Post]),
    FilesModule,
    ReactionModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = require('path').extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: QUEUES.NOTIFICATION_QUEUE,
      },
      {
        name: QUEUES.MEDIA_QUEUE,
      },
    ),
  ],
})
export class PostsModule {}
