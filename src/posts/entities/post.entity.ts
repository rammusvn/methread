import { Like } from 'src/likes/entities/like.entity';
import { Media } from 'src/media/entities/media.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author_id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: 0 })
  likes_count: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @ManyToOne(() => Post, (post) => post.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Post;

  @OneToMany(() => Post, (post) => post.parent)
  replies: Post[];

  @Column({ default: 0 })
  replies_count: number;

  @OneToMany(() => Media, (media) => media.post)
  media: Media[];
}
