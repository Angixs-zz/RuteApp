import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function ProtectedRoute({ rolesPermitidos }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando sesión...</div>;
  }

  if (!user) {
    // Si no está autenticado, lo mandamos al login
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    // Si no tiene el rol necesario, lo mandamos a un lugar seguro (por ejemplo, a /viajes si es cliente, o mostrar 403)
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Acceso Denegado</h1>
      <p>No tienes permiso para ver esta página.</p>
    </div>;
  }

  return <Outlet />;
}
