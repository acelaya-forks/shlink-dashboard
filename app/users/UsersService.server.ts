import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { verifyPassword } from '../auth/passwords.server';
import type { User } from '../entities/User';
import { User as UserEntity } from '../entities/User';

export type UserOrderableFields = keyof Omit<User, 'id' | 'password'>;

export type ListUsersOptions = {
  page?: number;
  orderBy?: Order<UserOrderableFields>;
  searchTerm?: string;
};

export type UsersList = {
  users: User[];
  totalUsers: number;
  totalPages: number;
};

export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async getUserByCredentials(username: string, password: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { username });
    if (!user) {
      throw new Error(`User not found with username ${username}`);
    }

    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error(`Incorrect password for user ${username}`);
    }

    return user;
  }

  async listUsers({ page = 1, orderBy, searchTerm }: ListUsersOptions): Promise<UsersList> {
    const positivePage = Math.max(1, page);
    const limit = 20;
    const offset = (positivePage - 1) * limit;

    const [users, totalUsers] = await this.em.findAndCount(
      UserEntity,
      this.buildListUsersWhere(searchTerm),
      {
        limit,
        offset,
        orderBy: {
          [orderBy?.field ?? 'createdAt']: orderBy?.dir ?? 'ASC',
        },
      },
    );

    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  private buildListUsersWhere(searchTerm?: string): FilterQuery<User> {
    if (!searchTerm) {
      return {};
    }

    const searchableFields: Array<keyof User> = ['displayName', 'username'];
    const lowerSearchTerm = searchTerm.toLowerCase();

    return {
      $or: searchableFields.flatMap((field) => [
        {
          [field]: {
            $like: `%${lowerSearchTerm}%`,
          },
        },
        {
          [field]: {
            $like: `%${searchTerm}%`,
          },
        },
      ]),
    };
  }
}
