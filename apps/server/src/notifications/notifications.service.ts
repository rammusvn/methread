import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CLIENTS, CMD } from 'apps/constants';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(CLIENTS.NOTIFICATION_SERVICE) private readonly client: ClientProxy,
  ) {}

  getNotification(userId: number) {
    return this.client.send(CMD.GET_NOTIFICATION, { userId: userId });
  }

  markAsRead(notificationId: string) {
    return this.client.send(CMD.MARK_AS_READ, {
      notificationId: notificationId,
    });
  }

  markAllAsRead(userId: number) {
    return this.client.send(CMD.MARK_ALL_AS_READ, {
      userId: userId,
    });
  }
}
