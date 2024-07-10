import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeConcertColumnNameMigration1720609294697
  implements MigrationInterface
{
  name = 'ChangeConcertColumnNameMigration1720609294697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concert" RENAME COLUMN "total_seats" TO "seat"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concert" RENAME COLUMN "seat" TO "total_seats"`,
    );
  }
}
