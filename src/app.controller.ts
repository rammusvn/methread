import {
  Controller,
  Get,
  Inject,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
@Controller()
export class AppController implements OnApplicationBootstrap {
  constructor(
    private readonly appService: AppService,
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientProxy,
  ) {}
  async onApplicationBootstrap() {
    await this.redisClient.connect();
  }

  @Get()
  @ApiExcludeEndpoint()
  getHello(): string {
    this.redisClient.emit('test_event', { msg: 'Hello from AppController' });

    return this.appService.getHello();
  }
  @EventPattern('test_event')
  handleTestEvent(data: any) {
    console.log('Received test_event:', data);
  }
}
