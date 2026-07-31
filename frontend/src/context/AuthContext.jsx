import { createContext, useState } from 'react';

// 1. Creamos el Contexto de Autenticación
export const AuthContext = createContext();

// 2. Función para leer y desencriptar los datos dentro del Token JWT
const decodificarToken = (token) => {
  try {
    // El token JWT se compone de 3 partes separadas por puntos: Encabezado.Payload.Firma
    const payloadBase64 = token.split('.')[1]; // Tomamos la 2da parte (Payload)
    const jsonTexto = atob(payloadBase64);      // Decodificamos el Base64 a texto JSON
    const datos = JSON.parse(jsonTexto);       // Convertimos el texto a Objeto JS

    return {
      id: datos.usuarioId,
      nombre: datos.nombre,
      correo: datos.sub,
      rol: datos.rol,
      exp: datos.exp
    };
  } catch (error) {
    console.error('El token no es válido o está corrupto', error);
    return null;
  }
};

// 3. Función para recuperar la sesión al recargar la página
const obtenerSesionInicial = () => {
  const token = localStorage.getItem('token');
  if (!token) return null; // Si no hay token guardado, no hay sesión

  const usuario = decodificarToken(token);

  // Verificar si el token ya expiró
  const tokenVencido = usuario?.exp && (usuario.exp * 1000 < Date.now());
  if (tokenVencido) {
    localStorage.removeItem('token'); // Borramos el token caducado
    return null;
  }

  return usuario;
};

// 4. Proveedor que envuelve la aplicación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(obtenerSesionInicial);

  // INICIAR SESIÓN: Recibe la respuesta del Backend, guarda el token y actualiza el usuario
  const loginContext = (respuestaBackend) => {
    // Si viene en objeto { token: '...' } o como texto directo '...'
    const token = respuestaBackend.token || respuestaBackend;
    
    // Guardamos la llave en la memoria del navegador
    localStorage.setItem('token', token);

    // Extraemos la información del usuario y actualizamos el estado en React
    const usuario = decodificarToken(token);
    setUser(usuario);
  };

  // CERRAR SESIÓN: Elimina el token y limpia la variable usuario
  const logoutContext = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};
