import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token'); localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
};

export const adminAPI = {
  createContent: (d) => api.post('/admin/content', d),
  uploadExcel: (fd) => api.post('/admin/upload-excel', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getContent: (params) => api.get('/admin/content', { params }),
  getContentProgress: (params) => api.get('/admin/content-progress', { params }),
  getUserProgress: (params) => api.get('/admin/user-progress', { params }),
  getStats: () => api.get('/admin/stats'),
};

export const tasksAPI = {
  getTasks: (params) => api.get('/tasks/', { params }),
  completeTask: (id) => api.post(`/tasks/complete/${id}`),
  getMyProgress: () => api.get('/tasks/my-progress'),
};

export default api;
