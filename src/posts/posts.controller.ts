import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from 'src/common/decorators/user.decoratos';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('')
  async findAll() {
    return await this.postsService.findAll();
  }
  @Get('/:id')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOneById(id);
  }
  @Get('/users/:userId')
  async findAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.postsService.findAllByUserId(userId);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() CurrentUser) {
    return this.postsService.create(createPostDto.content, CurrentUser.id);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() CurrentUser,
  ) {
    return this.postsService.update(id, updatePostDto, CurrentUser.id);
  }
  @Post('/:id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser,
  ) {
    return this.postsService.toggleLike(id, CurrentUser.id);
  }
}
