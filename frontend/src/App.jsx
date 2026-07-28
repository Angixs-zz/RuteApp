import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/jsx/login';
import Registro from './components/jsx/registro';
import ProtectedRoute from './components/jsx/ProtectedRoute';

import Dashboard from './components/jsx/Dashboard';
import MisViajes from './components/jsx/MisViajes';
import CrearViaje from './components/jsx/CrearViaje';
import DetalleViaje from './components/jsx/DetalleViaje';
import Participantes from './components/jsx/Participantes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/viajes" element={<MisViajes />} />
            <Route path="/viajes/:id" element={<DetalleViaje />} />
            <Route path="/detalle-viaje" element={<DetalleViaje />} />
            <Route path="/participantes" element={<Participantes />} />
            <Route path="/crear-viaje" element={<CrearViaje />} />
            <Route path="/viajes/crear" element={<CrearViaje />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;