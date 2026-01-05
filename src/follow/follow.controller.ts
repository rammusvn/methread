import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserData,
} from 'src/common/decorators/user.decorator';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('/:targetId')
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param('targetId', ParseIntPipe) targetId: number,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.followService.toggle(currentUser.id, targetId);
  }

  @Get('/:targetId/is-following')
  @UseGuards(JwtAuthGuard)
  async isFollowing(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.followService.isFollowing(currentUser.id, targetId);
  }

  @Get('/:userId/followers')
  getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowers(userId);
  }

  @Get('/:userId/following')
  getFollowing(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowing(userId);
  }
}
