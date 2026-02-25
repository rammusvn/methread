import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(private moduleRef: ModuleRef) {}
  async add(queueName: string, jobName: string, data: any) {
    const queue = this.moduleRef.get<Queue>(getQueueToken(queueName), {
      strict: false,
    });
    await queue.add(jobName, data);
  }
}
