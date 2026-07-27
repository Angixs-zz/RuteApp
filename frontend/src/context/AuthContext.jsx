import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decodedPayload = JSON.parse(decodedJson);
        
        setUser({
          correo: decodedPayload.sub,
          rol: decodedPayload.rol,
          exp: decodedPayload.exp
        });
      } catch (error) {
        console.error('Error al decodificar el token', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginContext = (token) => {
    localStorage.setItem('token', token);
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decodedPayload = JSON.parse(decodedJson);
      
      setUser({
        correo: decodedPayload.sub,
        rol: decodedPayload.rol,
        exp: decodedPayload.exp
      });
    } catch (error) {
      console.error('Error al decodificar el token en login', error);
    }
  };

  const logoutContext = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};
