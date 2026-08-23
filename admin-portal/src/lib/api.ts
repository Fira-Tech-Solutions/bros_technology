import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const get = (url: string, config?: any) => api.get(url, config);
export const post = (url: string, data?: any, config?: any) => api.post(url, data, config);
export const put = (url: string, data?: any, config?: any) => api.put(url, data, config);
export const patch = (url: string, data?: any, config?: any) => api.patch(url, data, config);
export const del = (url: string, config?: any) => api.delete(url, config);

export default api;
