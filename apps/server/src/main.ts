import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { initializeTransactionalContext } from 'typeorm-transactional';
async function bootstrap() {
  initializeTransactionalContext();
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }); // port for front-end
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      cookie: { maxAge: 3600000 },
      resave: false,
      saveUninitialized: false,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('user-system')
    .setDescription('user-system API description')
    .setVersion('1.0')
    .addTag('user-system')
    .addBearerAuth(
      {
        type: 'http',
        in: 'Header',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(Number(process.env.PORT));
}
bootstrap();
