import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769652067654 implements MigrationInterface {
  name = 'Migration1769652067654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "isActive"`);
  }
}
