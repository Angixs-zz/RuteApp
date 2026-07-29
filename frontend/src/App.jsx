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
            <Route path="/crear-viaje" element={<CrearViaje />} />
            <Route path="/viajes/crear" element={<CrearViaje />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
