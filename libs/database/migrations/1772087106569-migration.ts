import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772087106569 implements MigrationInterface {
  name = 'Migration1772087106569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "UQ_f4d027a9bba90a609c6aec40e37"`,
    );
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "snowflake_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "snowflake_id" bigint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "UQ_f4d027a9bba90a609c6aec40e37" UNIQUE ("snowflake_id")`,
    );
  }
}
