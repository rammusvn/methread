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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import {
  CurrentUser,
  type CurrentUserData,
} from '../common/decorators/user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsDto } from './dto/get-post.dto';
import { SaveService } from '../reaction/save/save.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly saveService: SaveService,
  ) {}

  @Get('')
  async findAll(@Query() query: GetPostsDto) {
    return await this.postsService.findAll(query);
  }
  @Get('/saved')
  @UseGuards(JwtAuthGuard)
  async findAllSavedPostByUserId(@CurrentUser() currentUser: CurrentUserData) {
    return await this.postsService.findAllSavedPostByUserId(currentUser.id);
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
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    console.log(createPostDto);
    return this.postsService.create(createPostDto, CurrentUser.id);
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
  @Get('/:id/is-saved')
  @UseGuards(JwtAuthGuard)
  async isSaved(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return await this.saveService.isSaved(id, CurrentUser.id);
  }

  @Post('/:id/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return this.postsService.toggleLike(id, CurrentUser.id);
  }

  @Post('/:id/save')
  @UseGuards(JwtAuthGuard)
  toggleSave(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() CurrentUser: CurrentUserData,
  ) {
    return this.saveService.toggle(id, CurrentUser.id);
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
