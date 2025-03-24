import {
  faArrowRightFromBracket as faLogout,
  faChevronDown as arrowIcon,
  faCogs,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from 'reactstrap';
import { useSession } from '../auth/session-context';
import { ShlinkLogo } from './ShlinkLogo';

export const MainHeader: FC = () => {
  const session = useSession();
  const [isOpen, toggleCollapse] = useToggle();
  const { pathname } = useLocation();

  return (
    <Navbar color="primary" dark fixed="top" className="tw:text-white tw:bg-lm-brand tw:dark:bg-dm-brand" expand="md">
      <NavbarBrand tag={Link} to="/" className="tw:flex tw:gap-2">
        <ShlinkLogo className="tw:w-[26px]" color="white" /> Shlink
      </NavbarBrand>

      {session !== null && (
        <>
          <NavbarToggler onClick={toggleCollapse}>
            <FontAwesomeIcon icon={arrowIcon} />
          </NavbarToggler>

          <Collapse navbar isOpen={isOpen}>
            <Nav navbar className="tw:ml-auto">
              {session.role === 'admin' && (
                <NavItem>
                  <NavLink tag={Link} to="/manage-users/1" active={pathname.startsWith('/manage-users')}>
                    <FontAwesomeIcon icon={faUsers} className="tw:mr-0.5" /> Manage users
                  </NavLink>
                </NavItem>
              )}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret tag="button" data-testid="display-name">
                  <FontAwesomeIcon icon={faUser} fixedWidth /> {session.displayName ?? session.username}
                </DropdownToggle>
                <DropdownMenu end>
                  <DropdownItem tag={Link} to="/settings" active={pathname.startsWith('/settings')}>
                    <FontAwesomeIcon icon={faCogs} fixedWidth className="tw:mr-0.5" /> Settings
                  </DropdownItem>
                  <DropdownItem divider tag="hr" />
                  <DropdownItem tag={Link} to="/logout">
                    <FontAwesomeIcon icon={faLogout} fixedWidth className="tw:mr-0.5" /> Logout
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </>
      )}
    </Navbar>
  );
};
