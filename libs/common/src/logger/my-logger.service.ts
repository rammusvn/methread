import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import SentryTransport from 'winston-transport-sentry-node';
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private readonly winstonLogger: winston.Logger;
  constructor(private configService: ConfigService) {
    super();

    const fileFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf((info) => {
        return `${info.timestamp} [${info.level.toUpperCase()}] [${info.context}]: ${info.message}`;
      }),
    );

    this.winstonLogger = winston.createLogger({
      level: 'info',
      format: fileFormat,
      transports: [
        new winston.transports.File({
          filename: 'logs/info.log',
          level: 'info',
        }),
        new SentryTransport({
          sentry: {
            dsn: configService.get<string>('SENTRY_DSN'),
          },
          level: 'error',
        }),
      ],
    });
  }
  error(message: any, trace: string) {
    this.winstonLogger.error('error', message, {
      context: this.context,
      stack: trace,
    });
    super.error(message, trace);
  }
  warn(message: any) {
    this.winstonLogger.warn('warn', message, {
      context: this.context,
    });
    super.warn(message);
  }
  log(message: any) {
    this.winstonLogger.log('info', message, {
      context: this.context,
    });
    super.log(message);
  }
  debug(message: any) {
    super.debug(message);
  }
  verbose(message: any) {
    super.verbose(message);
  }
}
