// client/src/lib/api.js
import axios from 'axios';
const DEV = import.meta.env.DEV;
const BASE = (DEV && (import.meta.env.VITE_API_URL || '').trim())
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';
const api = axios.create({ baseURL: BASE });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export default api;
