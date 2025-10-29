import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
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
};

// Update bookingsAPI
export const bookingsAPIExtended = {
  ...bookingsAPI,
  delete: (id: string) => apiClient.delete(`/bookings/${id}`),
};
