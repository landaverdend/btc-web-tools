import { Link, useLocation } from 'react-router-dom';
import './navbar.css';
import logo from '@assets/btc.png';
import { Flex } from 'antd';
import { APP_ROUTES } from '@/App';

type NavbarProps = {};
export default function Navbar({}: NavbarProps) {
  const location = useLocation();
  const currentView = '/' + location.pathname.substring(1) || 'script';

  return (
    <Flex align="center" justify="space-between" className="navbar-container">
      <div className="navbar-logo">
        <img src={logo} alt="logo" />
      </div>

      <Flex className="navbar-list" gap={15}>
        <Link to={APP_ROUTES.About} className={`navbar-list-item ${currentView === APP_ROUTES.About ? 'active' : ''}`}>
          About
        </Link>
        <Link to={APP_ROUTES.Tx} className={`navbar-list-item ${currentView === APP_ROUTES.Tx ? 'active' : ''}`}>
          Tx Viewer
        </Link>
        <Link to={APP_ROUTES.Script} className={`navbar-list-item ${currentView === APP_ROUTES.Script ? 'active' : ''}`}>
          Script Debugger
        </Link>
        <Link to={APP_ROUTES.Merkle} className={`navbar-list-item ${currentView === APP_ROUTES.Merkle ? 'active' : ''}`}>
          Merkle Tree
        </Link>
      </Flex>
    </Flex>
  );
}
