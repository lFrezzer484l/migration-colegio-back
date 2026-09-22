import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1790096200443 implements MigrationInterface {
    name = 'Init1790096200443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_e2a2cb8cfc8ef1b190deb855997"`);
        await queryRunner.query(`CREATE TABLE "ticket_admins" ("ticket_id" uuid NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_d399deaa1185a26b3d562f8d01a" PRIMARY KEY ("ticket_id", "admin_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_faa63408ea00739f19c45d6cda" ON "ticket_admins"  ("ticket_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7e5934a3f2e6e6eb2ebfc8e26" ON "ticket_admins"  ("admin_id") `);
        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "assigned_admin_id"`);
        await queryRunner.query(`ALTER TABLE "ticket_admins" ADD CONSTRAINT "FK_faa63408ea00739f19c45d6cda9" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "ticket_admins" ADD CONSTRAINT "FK_f7e5934a3f2e6e6eb2ebfc8e269" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket_admins" DROP CONSTRAINT "FK_f7e5934a3f2e6e6eb2ebfc8e269"`);
        await queryRunner.query(`ALTER TABLE "ticket_admins" DROP CONSTRAINT "FK_faa63408ea00739f19c45d6cda9"`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD "assigned_admin_id" uuid`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7e5934a3f2e6e6eb2ebfc8e26"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_faa63408ea00739f19c45d6cda"`);
        await queryRunner.query(`DROP TABLE "ticket_admins"`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_e2a2cb8cfc8ef1b190deb855997" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
