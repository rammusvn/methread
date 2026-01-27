import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserData,
} from '../common/decorators/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotification(@CurrentUser() currentUser: CurrentUserData) {
    return this.notificationsService.getNotification(currentUser.id);
  }

  @Patch('/:id/read')
  markAsRead(@Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId);
  }

  @Patch('/read-all')
  markAllAsRead(@CurrentUser() currentUser: CurrentUserData) {
    return this.notificationsService.markAllAsRead(currentUser.id);
  }
}
