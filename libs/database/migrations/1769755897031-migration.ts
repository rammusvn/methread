import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769755897031 implements MigrationInterface {
  name = 'Migration1769755897031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "rank_score"`);
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "rank_score" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "rank_score"`);
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "rank_score" integer NOT NULL DEFAULT '0'`,
    );
  }
}
