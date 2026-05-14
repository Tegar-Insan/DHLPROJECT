import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Interceptor to add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (username, password) => apiClient.post('/api/auth/login', { username, password }),
  verify: () => apiClient.get('/api/auth/verify')
};

// Incidents endpoints
export const incidentsAPI = {
  getAll: (filters = {}) => apiClient.get('/api/incidents', { params: filters }),
  getById: (id) => apiClient.get(`/api/incidents/${id}`),
  getStats: () => apiClient.get('/api/incidents/stats'),
  create: (data) => apiClient.post('/api/incidents', data),
  update: (id, data) => apiClient.put(`/api/incidents/${id}`, data),
  updateStatus: (id, status) => apiClient.patch(`/api/incidents/${id}/status`, { status }),
  delete: (id) => apiClient.delete(`/api/incidents/${id}`)
};

// Process endpoints
export const processAPI = {
  classify: (text) => apiClient.post('/api/process/classify', { text })
};

// Reports endpoints
export const reportsAPI = {
  getSummary: () => apiClient.get('/api/reports/summary')
};

// Health check
export const healthAPI = {
  check: () => apiClient.get('/api/health')
};

export default apiClient;
