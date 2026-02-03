import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { FilesModule } from '../files/files.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'apps/constants';
import { MediaProcessor } from './media.processor';
import { MediaController } from './media.controller';
import { CloudinaryAdapter } from '../files/adapters/cloudinary.adapter';
import { cloudinaryProvider } from '../files/providers/cloudinary.provider';

@Module({
  controllers: [MediaController],
  imports: [
    TypeOrmModule.forFeature([Media]),
    FilesModule,
    BullModule.registerQueue({
      name: QUEUES.MEDIA_QUEUE,
    }),
  ],
  providers: [
    MediaService,
    MediaProcessor,
    CloudinaryAdapter,
    cloudinaryProvider,
  ],
  exports: [MediaService],
})
export class MediaModule {}
