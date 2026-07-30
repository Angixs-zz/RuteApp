import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import '../css/styles.css';
import logoImg from '../../assets/logo.png';
import api from '../../service/api';

export default function Navbar({ invitacionesCount }) {
  const { user, logoutContext } = useContext(AuthContext);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [invitacionesPendientes, setInvitacionesPendientes] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (invitacionesCount !== undefined) return;
    if (!user || user.rol === 'ADMINISTRADOR') return;

    let activo = true;
    api.get('/participantes')
      .then((response) => {
        if (!activo) return;
        const participantes = Array.isArray(response.data) ? response.data : [];
        setInvitacionesPendientes(
          participantes.filter((p) => p.estadoInvitacion === 'PENDIENTE').length
        );
      })
      .catch(() => {
        if (activo) setInvitacionesPendientes(0);
      });

    return () => {
      activo = false;
    };
  }, [invitacionesCount, user]);

  const esAgencia = user?.rol === 'AGENCIA';
  const esAdministrador = user?.rol === 'ADMINISTRADOR';

  const cantidadInvitaciones = (invitacionesCount ?? invitacionesPendientes) > 0 && !esAgencia ? (invitacionesCount ?? invitacionesPendientes) : 0;

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    closeProfileMenu();
  };

  const confirmarLogout = () => {
    logoutContext();
    setShowLogoutModal(false);
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
          <Link className="brand compact" to={esAdministrador ? '/admin' : '/dashboard'}>
            <img src={logoImg} alt="RuteApp" style={{ height: '36px', width: 'auto' }} />
          </Link>
          
          <nav className={`app-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            {esAdministrador ? (
              <>
                <Link className={pathname === '/admin' ? 'active' : ''} to="/admin">Dashboard</Link>
                <Link className={pathname.startsWith('/admin/usuarios') ? 'active' : ''} to="/admin/usuarios">Usuarios</Link>
                <Link className={pathname.startsWith('/admin/viajes') ? 'active' : ''} to="/admin/viajes">Viajes</Link>
                <Link className={pathname.startsWith('/admin/actividades') ? 'active' : ''} to="/admin/actividades">Actividades</Link>
                <Link className={pathname.startsWith('/admin/gastos') ? 'active' : ''} to="/admin/gastos">Gastos</Link>
              </>
            ) : (
              <>
                <Link className={pathname === '/dashboard' ? 'active' : ''} to="/dashboard">Inicio</Link>
                <Link className={pathname.startsWith('/viajes') && !pathname.startsWith('/viajes-agencia') ? 'active' : ''} to="/viajes">Mis viajes</Link>
                {!esAgencia && (
                  <>
                <Link className={(pathname.startsWith('/viajes-agencia') || pathname === '/viajes-agencia') ? 'active' : ''} to="/viajes-agencia">Viajes de Agencia</Link>
                    <Link className={pathname === '/invitaciones' ? 'active' : ''} to="/invitaciones">
                      Invitaciones {cantidadInvitaciones > 0 && <span className="nav-badge">{cantidadInvitaciones}</span>}
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="user-menu">
            {cantidadInvitaciones > 0 && (
              <button className="icon-btn" aria-label="Notificaciones">
                <Bell size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /><span className="count">{cantidadInvitaciones}</span>
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

      <ConfirmModal 
        isOpen={showLogoutModal}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas salir de tu cuenta?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={confirmarLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
