import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeToken = (token) => {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decodedPayload = JSON.parse(decodedJson);

      return {
        id: decodedPayload.usuarioId,
        nombre: decodedPayload.nombre,
        correo: decodedPayload.sub,
        rol: decodedPayload.rol,
        exp: decodedPayload.exp
      };
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = decodeToken(token);
      if (userData && (!userData.exp || userData.exp * 1000 > Date.now())) {
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loginContext = (data) => {
    const token = typeof data === 'object' && data.token ? data.token : data;
    localStorage.setItem('token', token);
    const userData = decodeToken(token);
    if (userData) {
      if (typeof data === 'object' && data.nombre) {
        userData.nombre = data.nombre;
        userData.correo = data.correo || userData.correo;
        userData.id = data.usuarioId || userData.id;
      }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logoutContext = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};
