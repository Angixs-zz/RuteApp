import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';
import logoImg from '../../assets/react.svg';

export default function Navbar({ invitacionesCount = 0 }) {
  const { user, logoutContext } = useContext(AuthContext);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutContext();
    closeProfileMenu();
    navigate('/login');
  };

  const nombreUsuario = user?.nombre || 'Usuario';
  const correoUsuario = user?.correo || 'usuario@ruteapp.mx';

  // Avatar por defecto SVG
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230E7C7B'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

  const pathname = location.pathname;

  return (
    <>
      <header className="app-nav">
        <div className="container">
          <Link className="brand compact" to="/dashboard">
            <img src={logoImg} alt="RuteApp" style={{ height: '36px', width: 'auto' }} />
          </Link>
          
          <nav className={`app-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <Link className={pathname === '/dashboard' ? 'active' : ''} to="/dashboard">Inicio</Link>
            <Link className={pathname.startsWith('/viajes') ? 'active' : ''} to="/viajes">Mis viajes</Link>
            <Link className={pathname === '/invitaciones' ? 'active' : ''} to="/invitaciones">
              Invitaciones {invitacionesCount > 0 && <span className="nav-badge">{invitacionesCount}</span>}
            </Link>
            <Link className={pathname === '/gastos' ? 'active' : ''} to="/gastos">Gastos</Link>
          </nav>

          <div className="user-menu">
            {invitacionesCount > 0 && (
              <button className="icon-btn" aria-label="Notificaciones">
                🔔<span className="count">{invitacionesCount}</span>
              </button>
            )}
            
            <img 
              className="avatar" 
              src={defaultAvatar} 
              alt="Avatar"
              onClick={toggleProfileMenu}
              style={{ cursor: 'pointer' }}
            />

            <div className="user-copy" onClick={toggleProfileMenu} style={{ cursor: 'pointer' }}>
              <strong>{nombreUsuario}</strong>
              <span>{correoUsuario}</span>
            </div>

            <button 
              className="icon-btn" 
              onClick={toggleProfileMenu}
              aria-label="Menú de perfil"
            >
              ⌄
            </button>

            <button 
              className="icon-btn mobile-toggle"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Menú móvil"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Modal de perfil */}
      <div 
        className={`modal-backdrop ${isProfileMenuOpen ? 'open' : ''}`} 
        id="profileMenu"
        onClick={closeProfileMenu}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon">👤</div>
          <h3>Cuenta</h3>
          <p className="muted">Accede a tu perfil o cierra la sesión actual.</p>
          <div className="modal-actions">
            <Link className="button ghost" to="/perfil" onClick={closeProfileMenu}>
              Mi perfil
            </Link>
            <button className="button danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
