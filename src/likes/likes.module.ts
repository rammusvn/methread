import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesService } from './like.service';

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
