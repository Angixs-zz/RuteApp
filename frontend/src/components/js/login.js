import { useState } from 'react';
import api from '../../service/api';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrorEmail('');
    setErrorPassword('');
    setErrorGeneral('');
    setMensajeExito('');

    let hayErrores = false;

    if (!email.trim()) {
      setErrorEmail('El correo electrónico es obligatorio.');
      hayErrores = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorEmail('El formato del correo no es válido.');
      hayErrores = true;
    }

    if (!password) {
      setErrorPassword('La contraseña es obligatoria.');
      hayErrores = true;
    }

    if (hayErrores) return;

    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        correo: email,
        password
      });

      localStorage.setItem('token', response.data.token);
      setMensajeExito('¡Bienvenido a RuteApp!');
      
    } catch (error) {
      console.error(error);
      setErrorGeneral('Credenciales incorrectas o error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    errorEmail,
    errorPassword,
    errorGeneral,
    mensajeExito,
    loading,
    handleSubmit
  };
}