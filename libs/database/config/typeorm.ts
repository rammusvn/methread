import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Post } from '../../../apps/server/src/posts/entities/post.entity';
import { User } from '../../../apps/server/src/users/entities/user.entity';
import { SavedPost } from '../../../apps/server/src/reaction/save/entities/save.entity';
import { Follow } from '../../../apps/server/src/follow/entities/follow.entity';
import { Like } from '../../../apps/server/src/reaction/likes/entities/like.entity';
import { Media } from '../../../apps/server/src/media/entities/media.entity';
import {
  initializeTransactionalContext,
  addTransactionalDataSource,
  StorageDriver,
} from 'typeorm-transactional';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Post, User, SavedPost, Follow, Like, Media],
  migrations: [__dirname + '/../migrations/**/*{.js,.ts}'],
  synchronize: false,
  // logging: true,
};
const dataSource = new DataSource(dataSourceOptions);

initializeTransactionalContext({
  storageDriver: StorageDriver.ASYNC_LOCAL_STORAGE,
});
addTransactionalDataSource(dataSource);
export default dataSource;
