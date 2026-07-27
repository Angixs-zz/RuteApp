import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // La dirección donde corre tu Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar automáticamente el token JWT en las peticiones protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;