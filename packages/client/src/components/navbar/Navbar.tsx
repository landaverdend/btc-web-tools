import { ViewType } from '@/App';
import './navbar.css';
import logo from '@assets/btc.png';

type NavbarProps = {
  view: ViewType;
  setView: (view: ViewType) => void;
};
export default function Navbar({ view, setView }: NavbarProps) {
  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <img src={logo} alt="logo" />
      </div>

      <div className="flex-row navbar-list">
        <span
          className={`navbar-list-item ${view === 'tx' ? 'active' : ''}`}
          onClick={() => {
            setView('tx');
          }}>
          TX Viewer 
        </span>
        <span className={`navbar-list-item ${view === 'script' ? 'active' : ''}`} onClick={() => setView('script')}>
          Script Debugger
        </span>
      </div>
    </div>
  );
}
