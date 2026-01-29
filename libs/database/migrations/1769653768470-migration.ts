import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769653768470 implements MigrationInterface {
    name = 'Migration1769653768470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "deletedAt"`);
    }

}
