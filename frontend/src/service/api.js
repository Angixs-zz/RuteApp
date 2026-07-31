import axios from 'axios'; //imṕortamos la libreria para poder hacer peticiones 

const api = axios.create({ // instnacia de axios
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api'), //base quen se coloca antes de cada endpoint
  headers: { // informacion adicional que se envia en cada peticion
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar automáticamente el token JWT en las peticiones protegidas
api.interceptors.request.use( //atrapa las peticiones antes que se envien 
  (config) => {
    const token = localStorage.getItem('token'); //obtiene el token del local storage del suuario 
    if (token) { // si existe 
      config.headers.Authorization = `Bearer ${token}`; // agrega  el token al encabezado de la peticion para que depsue sea vlaidado
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
D