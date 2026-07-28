import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

export function useRegistro() {
  const navigate = useNavigate();
  
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rolId, setRolId] = useState('2');
  
  const [errorNombre, setErrorNombre] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    setErrorNombre('');
    setErrorCorreo('');
    setErrorPassword('');
    setErrorGeneral('');
    setMensajeExito('');

    let hayErrores = false;

    if (!nombre.trim()) {
      setErrorNombre('El nombre es obligatorio.');
      hayErrores = true;
    }

    if (!correo.trim()) {
      setErrorCorreo('El correo es obligatorio.');
      hayErrores = true; 
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      setErrorCorreo('El formato del correo no es válido.');
      hayErrores = true;
    }

    if (!password) {
      setErrorPassword('La contraseña es obligatoria.');
      hayErrores = true;
    } else {
      if (password.length < 8) {
        setErrorPassword('Mínimo 8 caracteres.');
        hayErrores = true;
      } else if (!/(?=.*[A-Z])/.test(password)) {
        setErrorPassword('Debe incluir una mayúscula.');
        hayErrores = true;
      } else if (!/(?=.*\d)/.test(password)) {
        setErrorPassword('Debe incluir un número.');
        hayErrores = true;
      } else if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
        setErrorPassword('Debe incluir un carácter especial.');
        hayErrores = true;
      }
    }

    if (hayErrores) return;

    setLoading(true);
    try {
      await api.post('/usuarios', {
        nombre,
        correo,
        password,
        avatar: null,
        rolId: Number(rolId)
      });

      setMensajeExito('¡Registro exitoso! Ya puedes iniciar sesión.');
      setNombre('');
      setCorreo('');
      setPassword('');
      setRolId('2');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorGeneral('Error al registrarse. Es posible que el correo ya esté registrado.');
    } finally {
      setLoading(false);
    }
  };

  return {
    nombre, setNombre,
    correo, setCorreo,
    password, setPassword,
    rolId, setRolId,
    errorNombre,
    errorCorreo,
    errorPassword,
    errorGeneral,
    mensajeExito,
    loading,
    handleRegister
  };
}