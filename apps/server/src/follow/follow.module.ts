import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { FollowController } from './follow.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule],
  providers: [FollowService],
  controllers: [FollowController],
})
export class FollowModule {}
