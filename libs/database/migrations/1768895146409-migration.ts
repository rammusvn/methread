import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768895146409 implements MigrationInterface {
  name = 'Migration1768895146409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follows" ADD "is_following" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "is_following"`);
  }
}
