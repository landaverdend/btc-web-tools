import { Link, useLocation } from 'react-router-dom';
import './navbar.css';
import logo from '@assets/btc.png';
import { APP_ROUTES } from '@/App';

type NavbarProps = {};
export default function Navbar({}: NavbarProps) {
  const location = useLocation();
  const currentView = '/' + location.pathname.substring(1) || 'script';

  return (
    <div className="flex flex-row place-content-between items-center p-5 bg-(--input-gray)">
      <div className="hidden sm:block">
        <img src={logo} alt="logo" className="w-20 h-20 rounded-sm border-1 border-[#a85d03]" />
      </div>

      <div className="flex flex-row gap-5">
        <Link
          to={APP_ROUTES.About}
          className={`text-sm sm:text-lg ${currentView === APP_ROUTES.About ? 'text-(--soft-orange-light)' : 'text-white'}`}>
          About
        </Link>
        <Link
          to={APP_ROUTES.Tx}
          className={`text-sm sm:text-lg ${currentView === APP_ROUTES.Tx ? 'text-(--soft-orange-light)' : 'text-white'}`}>
          Tx Viewer
        </Link>
        <Link
          to={APP_ROUTES.Script}
          className={`text-sm sm:text-lg  ${currentView === APP_ROUTES.Script ? 'text-(--soft-orange-light)' : 'text-white'}`}>
          Script Debugger
        </Link>
        <Link
          to={APP_ROUTES.Merkle}
          className={`text-sm sm:text-lg  ${currentView === APP_ROUTES.Merkle ? 'text-(--soft-orange-light)' : 'text-white'}`}>
          Merkle Tree
        </Link>
      </div>
    </div>
  );
}
