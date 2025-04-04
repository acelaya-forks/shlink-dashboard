import { faPlus, faTrashCan, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SearchInput, SimpleCard, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import { useState } from 'react';
import type { LoaderFunctionArgs, unstable_RouterContextProvider } from 'react-router';
import { href, Link , useLoaderData,useNavigate  } from 'react-router';
import { useSession } from '../../auth/session-context';
import { serverContainer } from '../../container/container.server';
import type { PlainServer } from '../../entities/Server';
import { sessionContext } from '../../middleware/middleware.server';
import { ServersService } from '../../servers/ServersService.server';
import { DeleteServerModal } from './DeleteServerModal';

export async function loader(
  { request, context }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const query = new URL(request.url).searchParams;
  const currentSearchTerm = query.get('search-term') ?? undefined;
  const sessionData = (context as unstable_RouterContextProvider).get(sessionContext);
  const populateUsers = sessionData.role === 'admin';
  const servers = await serversService.getUserServers(sessionData.userId, {
    populateUsers,
    searchTerm: currentSearchTerm,
  });

  return {
    servers: servers.map(({ users, ...rest }) => ({
      ...rest,
      usersCount: populateUsers ? users.count() : undefined,
    })),
    currentSearchTerm,
  };
}

export default function ListServers() {
  const session = useSession();
  const navigate = useNavigate();
  const { servers, currentSearchTerm } = useLoaderData<typeof loader>();

  const [serverToDelete, setServerToDelete] = useState<PlainServer>();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SearchInput
        placeholder="Search servers..."
        defaultValue={currentSearchTerm}
        onChange={(searchTerm) => navigate(searchTerm ? `?search-term=${searchTerm}` : '?', { replace: true })}
      />
      <div className="tw:flex tw:gap-4 tw:flex-col tw:lg:flex-row-reverse">
        <Button to="/manage-servers/create">
          <FontAwesomeIcon icon={faPlus} />
          Add a server
        </Button>
      </div>
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:gap-y-4" title="Shlink servers">
        <Table
          header={
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Base URL</Table.Cell>
              {session?.role === 'admin' && <Table.Cell>Users</Table.Cell>}
              <Table.Cell aria-hidden />
            </Table.Row>
          }
        >
          {servers.length === 0 && (
            <Table.Row className="tw:text-center">
              <Table.Cell colSpan={4} className="tw:italic">No servers found</Table.Cell>
            </Table.Row>
          )}
          {servers.map((server) => (
            <Table.Row key={server.publicId} className="tw:relative">
              <Table.Cell columnName="Name:">
                <Link className="tw:font-bold" to={href('/server/:serverId', { serverId: server.publicId })}>
                  {server.name}
                </Link>
              </Table.Cell>
              <Table.Cell columnName="Base URL:">{server.baseUrl}</Table.Cell>
              {server.usersCount !== undefined && (
                <Table.Cell columnName="Users:">
                  <div className="tw:inline-flex tw:items-center tw:gap-x-1">
                    <FontAwesomeIcon icon={faUsers} className="tw:max-lg:hidden" />
                    <span className="tw:sr-only">This server has</span>
                    <b data-testid={`users-count-${server.publicId}`}>{server.usersCount}</b>
                    <span className="tw:sr-only">user{server.usersCount === 1 ? '' : 's'}, including yourself.</span>
                  </div>
                </Table.Cell>
              )}
              <Table.Cell
                className={clsx(
                  'tw:lg:static tw:lg:[&]:border-b-1', // Big screens
                  'tw:absolute tw:top-0 tw:right-0 tw:[&]:border-b-0', // Small screens
                )}
              >
                <div className="tw:flex tw:justify-end tw:gap-x-1">
                  <Button
                    inline
                    size="sm"
                    variant="danger"
                    aria-label={`Delete server ${server.name}`}
                    onClick={() => {
                      setServerToDelete(server);
                      setDialogOpen(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </SimpleCard>

      <DeleteServerModal
        serverToDelete={serverToDelete}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
