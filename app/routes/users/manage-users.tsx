import { faSortAlphaAsc, faSortAlphaDesc } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { mergeDeepRight } from '@shlinkio/data-manipulation';
import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { orderToString } from '@shlinkio/shlink-frontend-kit';
import { determineOrder, SimpleCard, stringToOrder } from '@shlinkio/shlink-frontend-kit';
import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { Link } from 'react-router';
import { useNavigation } from 'react-router';
import { href, useLoaderData, useNavigate } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { Paginator } from '../../fe-kit/Paginator';
import { SearchInput } from '../../fe-kit/SearchInput';
import { Table } from '../../fe-kit/Table';
import type { ListUsersOptions, UserOrderableFields } from '../../users/UsersService.server';
import { UsersService } from '../../users/UsersService.server';
import { RoleBadge } from './RoleBadge';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }

  const query = new URL(request.url).searchParams;
  const orderByParam = query.get('orderBy');
  const orderBy = orderByParam ? stringToOrder<UserOrderableFields>(orderByParam) : {};
  const currentParams = {
    page: Number(params.page),
    orderBy,
    searchTerm: query.get('searchTerm') ?? undefined,
  } satisfies ListUsersOptions;
  const usersList = await usersService.listUsers(currentParams);

  return { ...usersList, currentParams };
}

function HeaderCell({ orderDir, to, children }: PropsWithChildren<{ orderDir: OrderDir; to: string }>) {
  return (
    <Table.Cell>
      <Link className="tw:text-current!" to={to}>
        {children}
      </Link>
      {orderDir && (
        <FontAwesomeIcon className="tw:ml-2" icon={orderDir === 'DESC' ? faSortAlphaDesc : faSortAlphaAsc} />
      )}
    </Table.Cell>
  );
}

export default function ManageUsers() {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { users, totalPages, currentParams } = useLoaderData<typeof loader>();
  const { field, dir } = currentParams.orderBy;

  const urlForParams = useCallback((newParams: ListUsersOptions) => {
    const query = new URLSearchParams();
    const mergedParams = mergeDeepRight(currentParams, newParams);
    const stringifiedOrderBy = orderToString(mergedParams.orderBy ?? {});

    if (stringifiedOrderBy) {
      query.set('orderBy', stringifiedOrderBy);
    }
    if (mergedParams.searchTerm) {
      query.set('searchTerm', mergedParams.searchTerm);
    }

    const queryString = query.size > 0 ? `?${query.toString()}` : '';
    const baseUrl = href('/manage-users/:page', { page: `${mergedParams.page}` });

    return `${baseUrl}${queryString}`;
  }, [currentParams]);
  const headerUrl = useCallback((newField: UserOrderableFields, dirFallback?: OrderDir) => urlForParams({
    page: 1,
    orderBy: determineOrder(field ?? newField, newField, dir ?? dirFallback),
  }), [dir, field, urlForParams]);

  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-3">
      <SearchInput
        defaultValue={currentParams.searchTerm}
        onChange={(searchTerm) => navigate(urlForParams({ page: 1, searchTerm }), { replace: true })}
      />
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:gap-y-3">
        <Table
          header={
            <Table.Row>
              <HeaderCell
                to={headerUrl('createdAt', 'ASC')}
                orderDir={(!field || field === 'createdAt') ? (dir ?? 'ASC') : undefined}
              >
                Created
              </HeaderCell>
              <HeaderCell
                to={headerUrl('username')}
                orderDir={field === 'username' ? dir : undefined}
              >
                Username
              </HeaderCell>
              <HeaderCell
                to={headerUrl('displayName')}
                orderDir={field === 'displayName' ? dir : undefined}
              >
                Display name
              </HeaderCell>
              <HeaderCell
                to={headerUrl('role')}
                orderDir={field === 'role' ? dir : undefined}
              >
                Role
              </HeaderCell>
            </Table.Row>
          }
        >
          {navigation.state === 'loading' ? (
            <Table.Row className="tw:text-center">
              <Table.Cell colSpan={4} className="tw:italic">Loading...</Table.Cell>
            </Table.Row>
          ) : (
            <>
              {users.length === 0 && (
                <Table.Row className="tw:text-center">
                  <Table.Cell colSpan={4} className="tw:italic">No users found</Table.Cell>
                </Table.Row>
              )}
              {users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.createdAt.toLocaleDateString()}</Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.displayName ?? '-'}</Table.Cell>
                  <Table.Cell><RoleBadge role={user.role}/></Table.Cell>
                </Table.Row>
              ))}
            </>
          )}
        </Table>
        {totalPages >= 2 && (
          <div className="tw:flex tw:justify-center">
            <Paginator
              pagesCount={totalPages}
              currentPage={currentParams.page}
              urlForPage={(page) => urlForParams({ page })}
            />
          </div>
        )}
      </SimpleCard>
    </Layout>
  );
}
