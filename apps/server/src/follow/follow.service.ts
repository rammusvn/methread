import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly userService: UsersService,
  ) {}
  async isFollowing(followerId: number, followingId: number) {
    const follow = await this.followRepository.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
    return !!follow;
  }
  async toggle(followerId: number, followingId: number) {
    await this.userService.findOne(followingId);

    const follow = await this.followRepository.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });
    if (follow) {
      await this.followRepository.remove(follow);
      await this.userService.decreaseFollowersCount(followingId);
      await this.userService.decreaseFollowingCount(followerId);
      return false;
    }
    const newFollow = this.followRepository.create({
      follower_id: followerId,
      following_id: followingId,
    });
    await this.followRepository.save(newFollow);
    await this.userService.increaseFollowersCount(followingId);
    await this.userService.increaseFollowingCount(followerId);
    return true;
  }

  async getFollowers(userId: number) {
    const followers = await this.followRepository
      .createQueryBuilder('follows')
      .innerJoin('follows.follower', 'follower') // Dùng innerJoin nếu chắc chắn follower tồn tại
      .where('follows.following_id = :id', { id: userId })
      .select(['follower.id ', 'follower.username ', 'follower.image as image'])
      .getRawMany();

    return followers;
  }
  async getFollowing(userId: number) {
    const following = await this.followRepository
      .createQueryBuilder('follows')
      .innerJoin('follows.following', 'following')
      .where('follows.follower_id = :id', { id: userId })
      .select([
        'following.id ',
        'following.username ',
        'following.image as image',
      ])
      .getRawMany();

    return following;
  }
}
