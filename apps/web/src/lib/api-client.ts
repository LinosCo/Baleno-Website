import axios from 'axios';

// Usa URL relativo per sfruttare il proxy Next.js (utile per ngrok)
// In produzione, imposta NEXT_PUBLIC_API_URL nel .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo rimuovi token e redirect al login se è un errore di autenticazione su endpoint protetti
    // Non farlo su errori di validazione o altri errori
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');

      // Rimuovi token solo se è un errore auth reale (non su login/register)
      if (!isAuthEndpoint || error.config?.url?.includes('/auth/me')) {
        console.error('Auth error - clearing token and redirecting to login', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Evita loop infiniti
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};

export const resourcesAPI = {
  getAll: (params?: any) => apiClient.get('/resources', { params }),
  getOne: (id: string) => apiClient.get(`/resources/${id}`),
};

export const bookingsAPI = {
  getAll: (params?: any) => apiClient.get('/bookings', { params }),
  getOne: (id: string) => apiClient.get(`/bookings/${id}`),
  create: (data: any) => apiClient.post('/bookings', data),
};

export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  updateRole: (id: string, role: string) => apiClient.put(`/users/${id}/role`, { role }),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Update bookingsAPI
export const bookingsAPIExtended = {
  ...bookingsAPI,
  delete: (id: string) => apiClient.delete(`/bookings/${id}`),
};
