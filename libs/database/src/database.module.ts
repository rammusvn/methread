import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Post } from 'apps/server/src/posts/entities/post.entity';
import { User } from 'apps/server/src/users/entities/user.entity';
import { Follow } from 'apps/server/src/follow/entities/follow.entity';
import { Like } from 'apps/server/src/reaction/likes/entities/like.entity';
import { SavedPost } from 'apps/server/src/reaction/save/entities/save.entity';
import { Media } from 'apps/server/src/media/entities/media.entity';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as any,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Post, User, Follow, Like, SavedPost, Media],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
