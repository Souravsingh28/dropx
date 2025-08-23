// client/src/lib/api.js
import axios from 'axios';

// In production builds (Vite), use same-origin "/api".
// In dev, use VITE_API_URL if provided (e.g. http://localhost:5000).
const baseURL = import.meta.env.PROD
  ? '/api'
  : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
