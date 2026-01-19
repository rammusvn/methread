import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'apps/server/src/follow/entities/follow.entity';
import { Repository } from 'typeorm';
import { NotificationsGateway } from './gateway/notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Follow) private followRepository: Repository<Follow>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getFollowersByUserId(userId: number) {
    const followers = await this.followRepository
      .createQueryBuilder('follow')
      .where('follow.following_id = :userId', { userId })
      .innerJoin('users', 'u', 'u.id = follow.follower_id')
      .select(['u.id as id', 'u.username as username', 'u.email as email'])
      .getRawMany();
    return followers;
  }
  async processNewPostNotification(post: any) {
    const followers = await this.getFollowersByUserId(post.author_id);
    const followersId = followers.map((follower) => follower.id);
    console.log(followersId);
    this.notificationsGateway.sendToFollowers(followersId, post);
    return;
  }
}
