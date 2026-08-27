// services/api.ts — Instância axios com interceptors JWT
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  timeout: 10_000,
});

// Injeta JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login em 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
