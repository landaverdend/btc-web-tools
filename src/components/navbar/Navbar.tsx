import './navbar.css';
import logo from '@assets/btc.png';

export default function Navbar() {
  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <img src={logo} alt="logo" />
      </div>

      <div className="flex-row navbar-list">
        <span>TX Parser</span>
      </div>
    </div>
  );
}
