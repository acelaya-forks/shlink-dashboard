import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { ServersRepository } from '../servers/ServersRepository.server';
import { BaseEntity, idColumnSchema } from './Base';
import { User } from './User';

export class Server extends BaseEntity {
  publicId!: string;
  baseUrl!: string;
  apiKey!: string;
  name!: string;
  users!: User[];
}

export const ServerSchema = new EntitySchema({
  class: Server,
  repository: () => ServersRepository,
  tableName: 'servers',
  properties: {
    id: idColumnSchema,
    baseUrl: {
      type: 'string',
      name: 'base_url',
    },
    apiKey: {
      type: 'string',
      name: 'api_key',
    },
    name: { type: 'string' },
    publicId: {
      type: 'string',
      name: 'public_id',
      unique: true,
      generated: 'uuid',
    },
    users: {
      kind: ReferenceKind.MANY_TO_MANY,
      entity: () => User,
      pivotTable: 'user_has_servers',
      joinColumn: 'server_id',
      inverseJoinColumn: 'user_id',
    },
  },
});
