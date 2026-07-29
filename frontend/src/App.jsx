import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/jsx/login';
import Registro from './components/jsx/registro';
import RecuperarContrasena from './components/jsx/RecuperarContrasena';
import RestablecerContrasena from './components/jsx/RestablecerContrasena';
import Inicio from './components/jsx/Inicio';
import ProtectedRoute from './components/jsx/ProtectedRoute';

import Dashboard from './components/jsx/Dashboard';
import MisViajes from './components/jsx/MisViajes';
import CrearViaje from './components/jsx/CrearViaje';
import DetalleViaje from './components/jsx/DetalleViaje';
import Participantes from './components/jsx/Participantes';
import Itinerario from './components/jsx/Itinerario';
import CrearActividad from './components/jsx/CrearActividad';
import Gastos from './components/jsx/Gastos';
import Invitaciones from './components/jsx/Invitaciones';
import Perfil from './components/jsx/Perfil';
import AdminDashboard from './components/jsx/AdminDashboard';
import AdminUsuarios from './components/jsx/AdminUsuarios';
import AdminUsuarioDetalle from './components/jsx/AdminUsuarioDetalle';
import AdminViajes from './components/jsx/AdminViajes';
import AdminViajeDetalle from './components/jsx/AdminViajeDetalle';
import AdminUsuarioForm from './components/jsx/AdminUsuarioForm';
import AdminViajeForm from './components/jsx/AdminViajeForm';
import AdminActividades from './components/jsx/AdminActividades';
import AdminGastos from './components/jsx/AdminGastos';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/viajes" element={<MisViajes />} />
            <Route path="/invitaciones" element={<Invitaciones />} />
            <Route path="/viajes/:id" element={<DetalleViaje />} />
            <Route path="/detalle-viaje" element={<DetalleViaje />} />
            <Route path="/participantes" element={<Participantes />} />
            <Route path="/viajes/:id/participantes" element={<Participantes />} />
            <Route path="/itinerario" element={<Itinerario />} />
            <Route path="/viajes/:id/itinerario" element={<Itinerario />} />
            <Route path="/crear-actividad" element={<CrearActividad />} />
            <Route path="/viajes/:id/crear-actividad" element={<CrearActividad />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/viajes/:id/gastos" element={<Gastos />} />
          </Route>
          <Route element={<ProtectedRoute rolesPermitidos={['USUARIO', 'AGENCIA']} />}>
            <Route path="/crear-viaje" element={<CrearViaje />} />
            <Route path="/viajes/crear" element={<CrearViaje />} />
          </Route>
          <Route element={<ProtectedRoute rolesPermitidos={['ADMINISTRADOR']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/usuarios/:id" element={<AdminUsuarioDetalle />} />
            <Route path="/admin/usuarios/nuevo" element={<AdminUsuarioForm />} />
            <Route path="/admin/usuarios/:id/editar" element={<AdminUsuarioForm />} />
            <Route path="/admin/viajes" element={<AdminViajes />} />
            <Route path="/admin/viajes/:id" element={<AdminViajeDetalle />} />
            <Route path="/admin/viajes/:id/editar" element={<AdminViajeForm />} />
            <Route path="/admin/actividades" element={<AdminActividades />} />
            <Route path="/admin/gastos" element={<AdminGastos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
