import { Link, useLocation } from 'react-router-dom';
import logo from '@assets/btc.png';
import { APP_ROUTES } from '@/App';
import { useTxStore } from '@/state/txStore';
import { useScriptEditorStore } from '@/state/scriptEditorStore';

type NavbarProps = {};
export default function Navbar({}: NavbarProps) {
  const location = useLocation();
  const currentView = '/' + location.pathname.substring(1) || 'script';
  const { reset } = useTxStore();
  const { reset: resetScriptEditor } = useScriptEditorStore();

  const handleClick = () => {
    reset();
    resetScriptEditor();
  };

  const navItems = [
    { to: APP_ROUTES.About, label: 'About' },
    { to: APP_ROUTES.Tx, label: 'Tx Viewer' },
    { to: APP_ROUTES.Script, label: 'Script Debugger' },
    { to: APP_ROUTES.Merkle, label: 'Merkle Tree' },
  ];

  return (
    <nav className="flex flex-row justify-between items-center px-6 py-4 bg-gradient-to-r from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] border-b border-[#2a2a2a]">
      {/* Logo */}
      <Link to={APP_ROUTES.About} onClick={handleClick} className="hidden sm:block group">
        <div className="relative">
          <img
            src={logo}
            alt="logo"
            className="w-16 h-16 rounded-lg border-2 border-[#f7931a]/30 group-hover:border-[#f7931a]/60 transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-lg bg-[#f7931a]/0 group-hover:bg-[#f7931a]/10 transition-all duration-300" />
        </div>
      </Link>

      {/* Nav Links */}
      <div className="flex flex-row items-center gap-1 sm:gap-2">
        {navItems.map(({ to, label }) => {
          const isActive = currentView === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={handleClick}
              className={`
                relative px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'text-[#f7931a] bg-[#f7931a]/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
