import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UsersController } from './users/users.controller';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { FreezePipe } from './common/pipes/freeze.pipe';
import { loggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PostsModule } from './posts/posts.module';
import KeyvRedis from '@keyv/redis';
import * as Joi from 'joi';
import { FollowModule } from './follow/follow.module';
import { MediaModule } from './media/media.module';
import { DatabaseModule } from '@app/database';
import { ReactionModule } from './reaction/reaction.module';
import { LoggerModule } from '../../../libs/common/src/logger/logger.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    PostsModule,
    FollowModule,
    MediaModule,
    DatabaseModule,
    ReactionModule,
    LoggerModule,
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),
          },
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        return {
          stores: [new KeyvRedis(configService.get<string>('REDIS_URL'))],
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        JWT_SECRET: Joi.string().min(5).required(),
        SESSION_SECRET: Joi.string().min(5).required(),
        PORT: Joi.number().port().required(),

        DB_TYPE: Joi.string().required(),
        DB_HOST: Joi.string().hostname().required(),
        DB_PORT: Joi.number().port().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),

        MEZON_CLIENT_ID: Joi.string().required(),
        MEZON_CLIENT_SECRET: Joi.string().required(),
        MEZON_AUTH_URL: Joi.string().uri().required(),
        MEZON_TOKEN_URL: Joi.string().uri().required(),
        MEZON_CALLBACK_URL: Joi.string().uri().required(),
        MEZON_USER_URL: Joi.string().uri().required(),

        REDIS_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().hostname().required(),
        REDIS_PORT: Joi.number().port().required(),

        CLIENT_URL: Joi.string().uri().required(),
      }),
    }),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_PIPE,
    //   useClass: FreezePipe,
    // },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: loggingInterceptor },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(UsersController);
  }
}
