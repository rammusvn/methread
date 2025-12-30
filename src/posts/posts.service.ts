import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikesService } from 'src/likes/like.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly userService: UsersService,
    private readonly likeService: LikesService,
  ) {}
  async findAll(query: GetPostsDto) {
    const { cursor, limit = 6 } = query;
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.parent_id is null')
      .orderBy('post.id', 'DESC')
      .take(limit + 1)
      .leftJoin('post.author', 'author')
      .addSelect(['author.id', 'author.username', 'author.image']);
    if (cursor) {
      queryBuilder.andWhere(' post.id < :cursor', {
        cursor,
      });
    }
    const posts = await queryBuilder.getMany();
    const hasNextPage = posts.length > limit;
    if (hasNextPage) {
      posts.pop();
    }
    const nextCursor = hasNextPage ? posts[posts.length - 1].id : null;
    return {
      posts: posts,
      nextCursor,
      hasNextPage,
    };
  }

  async findOneById(id: number): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: {
        author: true,
      },
      select: {
        author: {
          id: true,
          username: true,
          image: true,
        },
      },
    });
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
      select: {
        author: {
          id: true,
          username: true,
          image: true,
        },
      },
    });
  }

  async findAllByParentId(parentId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { parent_id: parentId },
      relations: {
        author: true,
      },
      select: {
        author: {
          id: true,
          username: true,
          image: true,
        },
      },
    });
  }

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    try {
      const author = await this.userService.findOne(userId);
      if (!author) {
        throw new HttpException('author not found', HttpStatus.NOT_FOUND);
      }
      if (createPostDto.parent_id) {
        const parent = await this.postRepository.findOneBy({
          id: createPostDto.parent_id,
        });
        if (!parent) {
          throw new HttpException('post is not exist ', HttpStatus.NOT_FOUND);
        }
        parent.replies_count += 1;
        await this.postRepository.save(parent);
      }
      const newPost = this.postRepository.create({
        content: createPostDto.content,
        author_id: userId,
        parent_id: createPostDto.parent_id,
      });

      return await this.postRepository.save(newPost);
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

  async isLike(postId: number, userId: number) {
    return await this.likeService.isLike(postId, userId);
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
