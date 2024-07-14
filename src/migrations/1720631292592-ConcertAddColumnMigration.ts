import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConcertAddColumnMigration1720631292592
  implements MigrationInterface
{
  name = 'ConcertAddColumnMigration1720631292592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concert" ADD "available_seats" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concert" DROP COLUMN "available_seats"`,
    );
  }
}
