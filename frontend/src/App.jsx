import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/jsx/Login';
import Registro from './components/jsx/registro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz al login por defecto */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Ruta para el Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta para el Registro */}
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;