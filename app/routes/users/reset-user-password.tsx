import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGoBack } from '@shlinkio/shlink-frontend-kit';
import { Button, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import { useCallback } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { useFetcher, useLoaderData } from 'react-router';
import { CopyToClipboard } from '../../common/CopyToClipboard';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';

export async function loader(
  { params }: LoaderFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userId } = params;
  const user = await usersService.getUserById(userId!);
  return { user };
}

export async function action(
  { params }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userId } = params;
  const [user, plainTextPassword] = await usersService.resetUserPassword(userId!);

  return { user, plainTextPassword };
}

export default function ResetUserPassword() {
  const goBak = useGoBack();
  const { user } = useLoaderData<typeof loader>();
  const { state, data, submit } = useFetcher<typeof action>();
  const submitting = state === 'submitting';
  const resetPassword = useCallback(() => submit({}, { method: 'POST' }), [submit]);

  return (
    <SimpleCard title={`Reset "${user.username}" password`} bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
      {!data && (
        <>
          <p className="tw:font-bold"><span className="tw:text-danger">Caution!</span> This action cannot be undone.</p>
          <p>Are you sure you want to reset <b>{user.username}</b> password?</p>
          <div className="tw:flex tw:justify-end tw:gap-2">
            <Button variant="secondary" disabled={submitting} onClick={goBak}>Cancel</Button>
            <Button variant="danger" solid disabled={submitting} onClick={resetPassword}>
              {submitting ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        </>
      )}
      {data && (
        <>
          <p>Password for <b>{data.user.username}</b> properly reset.</p>
          <p>
            Their new temporary password
            is <CopyToClipboard text={data.plainTextPassword}>
              <b>{data.plainTextPassword}</b>
            </CopyToClipboard>. The user will have to change it the first time they log in.
          </p>
          <div>
            <Button inline to="/manage-users/1"><FontAwesomeIcon icon={faArrowLeft} /> Manage users</Button>
          </div>
        </>
      )}
    </SimpleCard>
  );
}
