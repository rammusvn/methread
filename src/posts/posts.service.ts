import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikesService } from 'src/likes/like.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly userService: UsersService,
    private readonly likeService: LikesService,
  ) {}
  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      take: 10,
      relations: {
        author: true,
      },
    });
  }

  async findOneById(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }
  async findAllByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { author_id: userId },
      relations: {
        author: true,
      },
    });
  }

  async create(content: string, userId: number): Promise<Post> {
    try {
      const author = await this.userService.findOne(userId);
      if (!author) {
        throw new HttpException('author not found', HttpStatus.NOT_FOUND);
      }
      const createdPost = this.postRepository.create({
        content: content,
        author_id: userId,
        author: author,
      });
      return await this.postRepository.save(createdPost);
    } catch (error) {
      console.log(error);
      throw new HttpException('failed to create post', 500);
    }
  }

  async update(postId: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }
    if (post.author_id !== userId) {
      throw new HttpException(
        'You are not the author of this post',
        HttpStatus.UNAUTHORIZED,
      );
    }
    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async toggleLike(postId: number, userId: number) {
    const res = await this.likeService.toggle(postId, userId);
    if (res) {
      await this.increaseLikeCount(postId);
    } else {
      await this.decreaseLikeCount(postId);
    }
  }

  async increaseLikeCount(postId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }
    post.likes_count += 1;
    return await this.postRepository.save(post);
  }
  async decreaseLikeCount(postId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }
    post.likes_count -= 1;
    return await this.postRepository.save(post);
  }
}
