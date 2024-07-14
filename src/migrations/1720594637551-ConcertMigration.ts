import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConcertMigration1720594637551 implements MigrationInterface {
  name = 'ConcertMigration1720594637551';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "concert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(220) NOT NULL, "description" character varying(220) NOT NULL, "total_seats" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid, CONSTRAINT "UQ_39859cb43ac2bc86a2de7d56fc4" UNIQUE ("name"), CONSTRAINT "PK_c96bfb33ee9a95525a3f5269d1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "concert" ADD CONSTRAINT "FK_a4062da1e1da99458abf5aa910e" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concert" DROP CONSTRAINT "FK_a4062da1e1da99458abf5aa910e"`,
    );
    await queryRunner.query(`DROP TABLE "concert"`);
  }
}
