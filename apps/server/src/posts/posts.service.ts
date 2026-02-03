import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-post.dto';
import { GRAVITY, JOBS, QUEUES } from 'apps/constants';
import { LikesService } from '../reaction/likes/like.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '@app/common/logger/my-logger.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly likeService: LikesService,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
    @InjectQueue(QUEUES.NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    @InjectQueue(QUEUES.MEDIA_QUEUE)
    private readonly mediaQueue: Queue,
  ) {
    this.logger.setContext(PostsService.name);
  }
  async findAll(query: GetPostsDto) {
    const { cursor, limit = 6 } = query;
    this.logger.debug('currentCursor : ' + cursor);
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.author', 'author')
      .leftJoinAndSelect('post.media', 'media')
      .addSelect(['author.id', 'author.username', 'author.image'])
      .orderBy('post.rank_score', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .where('post.parent_id is null and post.isActive = true')
      .take(limit + 1);
    if (cursor) {
      queryBuilder.andWhere(' post.rank_score < :cursor', {
        cursor,
      });
    }
    const posts = await queryBuilder.getMany();
    const hasNextPage = posts.length > limit;
    if (hasNextPage) {
      posts.pop();
    }
    const nextCursor = hasNextPage ? posts[posts.length - 1].rank_score : null;
    this.logger.debug('NextCursor : ' + nextCursor);
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
        media: true,
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
  async findAllParentPostByUserId(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { author_id: userId, parent_id: IsNull() },
      relations: {
        author: true,
        media: true,
      },
      select: {
        author: {
          id: true,
          username: true,
          image: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findAllByParentId(parentId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { parent_id: parentId },
      relations: {
        author: true,
        media: true,
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

  async findAllSavedPostByUserId(userId: number) {
    const query = this.postRepository.createQueryBuilder('post');
    query
      .innerJoin('saved_post', 'saved_post', 'saved_post.post_id = post.id')
      .where('saved_post.user_id = :userId', { userId })
      .andWhere('saved_post.is_saved = :isSaved', { isSaved: true })
      .leftJoin('post.author', 'author')
      .addSelect(['author.id', 'author.username', 'author.image'])
      .leftJoinAndSelect('post.media', 'media');
    return await query.getMany();
  }

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (createPostDto.parent_id) {
        const parent = await this.postRepository.findOneBy({
          id: createPostDto.parent_id,
        });
        if (!parent) {
          throw new HttpException('post is not exist ', HttpStatus.NOT_FOUND);
        }
        await this.postRepository.increment(
          { id: parent.id },
          'replies_count',
          1,
        );
      }
      const newPost = this.postRepository.create({
        content: createPostDto.content,
        author_id: userId,
        parent_id: createPostDto.parent_id,
      });
      await this.postRepository.save(newPost);
      await this.mediaQueue.add(JOBS.CREATE_MEDIA, {
        postId: newPost.id,
        media: createPostDto.media,
      });

      await queryRunner.commitTransaction();
      if (!createPostDto.parent_id) {
        const sentData = await this.findOneById(newPost.id);
        await this.notificationQueue.add(
          JOBS.NEW_POST,
          {
            post: sentData,
          },
          {
            attempts: 3,
            backoff: 2000,
          },
        );
      }
      return newPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error, 'failed to create post');
      throw new HttpException('failed to create post', 500);
    } finally {
      await queryRunner.release();
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
  @Transactional()
  async toggleLike(postId: number, userId: number) {
    const res = await this.likeService.toggle(postId, userId);
    return await this.postRepository.increment(
      { id: postId },
      'likes_count',
      res,
    );
  }

  async increaseLikeCount(postId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }

    await this.postRepository.increment({ id: postId }, 'likes_count', 1);
    return await this.postRepository.findOneBy({ id: postId });
  }
  async decreaseLikeCount(postId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new HttpException('post not found', HttpStatus.NOT_FOUND);
    }

    await this.postRepository.decrement({ id: postId }, 'likes_count', 1);

    return await this.postRepository.findOneBy({ id: postId });
  }

  async remove(postId: number, userId: number): Promise<Post> {
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
    await this.postRepository.update(postId, { isActive: false });
    await this.postRepository.softRemove(post);
    return post;
  }
}
