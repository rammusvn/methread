import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772086904425 implements MigrationInterface {
  name = 'Migration1772086904425';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "saved_post" DROP CONSTRAINT "FK_667736eef71e667998427203476"`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_20dc152fa567df67110b94d6f16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_d8be760cd953c4a98137c5237a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "posts_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "saved_post" ADD CONSTRAINT "FK_667736eef71e667998427203476" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_20dc152fa567df67110b94d6f16" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_d8be760cd953c4a98137c5237a6" FOREIGN KEY ("parent_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_d8be760cd953c4a98137c5237a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_20dc152fa567df67110b94d6f16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" DROP CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_post" DROP CONSTRAINT "FK_667736eef71e667998427203476"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "posts_id_seq" OWNED BY "posts"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ALTER COLUMN "id" SET DEFAULT nextval('"posts_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_d8be760cd953c4a98137c5237a6" FOREIGN KEY ("parent_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_20dc152fa567df67110b94d6f16" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "likes" ADD CONSTRAINT "FK_741df9b9b72f328a6d6f63e79ff" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_post" ADD CONSTRAINT "FK_667736eef71e667998427203476" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
