import type { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Server } from '../entities/Server';

export class ServersRepository extends EntityRepository<Server> {
  findByPublicIdAndUserId(publicId: string, userId: string): Promise<Server | null> {
    const qb = this.em.qb(Server, 'server');
    qb.innerJoin('server.users', 'user')
      .where({ publicId, 'user.id': userId })
      .limit(1);

    return qb.getSingleResult();
  }
}

export function createServersRepository(em: EntityManager): ServersRepository {
  return em.getRepository(Server);
}
