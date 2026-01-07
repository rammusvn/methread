import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  }); // port for front-end
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your_secret_key',
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
  await app.startAllMicroservices();
  await app.listen(Number(process.env.PORT));
}
bootstrap();
