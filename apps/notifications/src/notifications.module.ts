import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'apps/server/src/posts/entities/post.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from 'apps/server/src/users/entities/user.entity';
import { Follow } from 'apps/server/src/follow/entities/follow.entity';
import { Media } from 'apps/server/src/media/entities/media.entity';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([Post, User, Follow, Media]),
    GatewayModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
