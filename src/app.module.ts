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
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { FreezePipe } from './common/pipes/freeze.pipe';
import { AuthGuard } from './common/guards/auth.guard';
import { loggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/exception-filters/http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PostsModule } from './posts/posts.module';
import KeyvRedis from '@keyv/redis';
import * as Joi from 'joi';
import { LikesModule } from './likes/likes.module';
import { FollowModule } from './follow/follow.module';
import { MediaModule } from './media/media.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    PostsModule,
    LikesModule,
    FollowModule,
    MediaModule,
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
        NODE_ENV: Joi.string().valid('dev', 'product', 'test').default('dev'),

        PORT: Joi.number().port().default(3000),

        JWT_SECRET: Joi.string().min(5).required(),

        SESSION_SECRET: Joi.string().min(5).required(),

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
      }),
    }),

    //config type orm here
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    {
      provide: APP_PIPE,
      useClass: FreezePipe,
    },
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
