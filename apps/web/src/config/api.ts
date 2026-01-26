export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    forgotPassword: `${API_URL}/auth/forgot-password`,
    resetPassword: `${API_URL}/auth/reset-password`,
  },
  resources: `${API_URL}/resources`,
  bookings: `${API_URL}/bookings`,
  manualBookings: `${API_URL}/bookings/manual`,
  users: `${API_URL}/users`,
  payments: `${API_URL}/payments`,
  reports: `${API_URL}/reports`,
};
