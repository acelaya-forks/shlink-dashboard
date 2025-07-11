import { Migration } from '@mikro-orm/migrations';

export class Migration20240608073312 extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.createTable('users', (table) => {
      table.increments('id').unsigned().primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable();
      table.string('display_name');
      table.dateTime('created_at');
    });

    await knex.schema.createTable('settings', (table) => {
      table.increments('id').unsigned().primary();
      table.integer('user_id').unsigned();
      table.json('settings');

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

      table.unique('user_id', { indexName: 'IDX_user_settings' });
    });

    await knex.schema.createTable('servers', (table) => {
      table.increments('id').unsigned().primary();
      table.string('name').notNullable();
      table.string('base_url').notNullable();
      table.string('api_key').notNullable();
      table.string('public_id').notNullable().unique();
    });

    await knex.schema.createTable('user_has_servers', (table) => {
      table.increments('id').unsigned().primary();
      table.integer('user_id').unsigned();
      table.integer('server_id').unsigned();

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('server_id').references('id').inTable('servers').onDelete('CASCADE');
    });

    await knex.schema.createTable('tags', (table) => {
      table.increments('id').unsigned().primary();
      table.string('tag').notNullable();
      table.string('color').notNullable();
      table.integer('user_id').unsigned();
      table.integer('server_id').unsigned();

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('server_id').references('id').inTable('servers').onDelete('CASCADE');

      table.unique(['tag', 'user_id', 'server_id'], { indexName: 'IDX_tag_user_server' });
    });
  }

  async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.dropTable('tags');
    await knex.schema.dropTable('settings');
    await knex.schema.dropTable('user_has_servers');
    await knex.schema.dropTable('servers');
    await knex.schema.dropTable('users');
  }
}
