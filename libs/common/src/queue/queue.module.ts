import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'apps/constants';

@Module({
  providers: [QueueService],
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUES.NOTIFICATION_QUEUE,
      },
      {
        name: QUEUES.MEDIA_QUEUE,
      },
    ),
  ],
  exports: [QueueService],
})
export class QueueModule {}
