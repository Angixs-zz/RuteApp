import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import '../css/styles.css';
import logoImg from '../../assets/logo.jpeg';

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

  // Avatar dinámico
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&background=random`;

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
          </nav>

          <div className="user-menu">
            {invitacionesCount > 0 && (
              <button className="icon-btn" aria-label="Notificaciones">
                <Bell size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /><span className="count">{invitacionesCount}</span>
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
          <div className="modal-icon"><User size={28} /></div>
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
