import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import {
  CurrentUser,
  type CurrentUserData,
} from 'src/common/decorators/user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsDto } from './dto/get-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('')
  async findAll(@Query() query: GetPostsDto) {
    console.log(query);
    return await this.postsService.findAll(query);
  }
  @Get('/:id')
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOneById(id);
  }
  @Get('/users/:userId')
  async findAllParentPostByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.postsService.findAllParentPostByUserId(userId);
  }
  @Get('/:id/replies')
  async findAllByParentId(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findAllByParentId(id);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() CurrentUser: CurrentUserData,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.create(createPostDto, files, CurrentUser.id);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return this.postsService.update(id, updatePostDto, CurrentUser.id);
  }

  @Get('/:id/is-like')
  @UseGuards(JwtAuthGuard)
  async isLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return await this.postsService.isLike(id, CurrentUser.id);
  }

  @Post('/:id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return this.postsService.toggleLike(id, CurrentUser.id);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return this.postsService.remove(id, CurrentUser.id);
  }
}
