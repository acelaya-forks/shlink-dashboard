import { Migration } from '@mikro-orm/migrations';

export class Migration20260117070847 extends Migration {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.table('user_has_servers', (builder) => {
      builder.unique(['user_id', 'server_id'], { indexName: 'IDX_user_server' });
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.table('user_has_servers', (builder) => {
      builder.dropUnique(['user_id', 'server_id'], 'IDX_user_server');
    });
  }
}
