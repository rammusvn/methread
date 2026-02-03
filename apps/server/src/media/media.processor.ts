import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUES } from 'apps/constants';
import { Job } from 'bullmq';
import { MediaService } from './media.service';

@Processor(QUEUES.MEDIA_QUEUE)
export class MediaProcessor extends WorkerHost {
  constructor(private readonly mediaService: MediaService) {
    super();
  }

  process(job: Job, token?: string): Promise<any> {
    const postId = job.data.postId;
    const media = job.data.media;
    console.log(job.data);
    return this.mediaService.createMediaForPost(postId, media);
  }
}
