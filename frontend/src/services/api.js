import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updateprofile', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data)
};

// Projects API
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
  addNote: (id, data) => api.post(`/projects/${id}/notes`, data)
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getMy: () => api.get('/tasks/my'),
  getKanban: (projectId) => api.get(`/tasks/kanban/${projectId}`),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data)
};

// Members API
export const membersAPI = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  getStats: () => api.get('/members/stats'),
  bulkImport: (data) => api.post('/members/bulk', data)
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getStats: () => api.get('/events/stats'),
  register: (id, data) => api.post(`/events/${id}/register`, data),
  addFeedback: (id, data) => api.post(`/events/${id}/feedback`, data)
};

// Finance API
export const financeAPI = {
  getAll: (params) => api.get('/finance', { params }),
  getById: (id) => api.get(`/finance/${id}`),
  create: (data) => api.post('/finance', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
  getStats: (params) => api.get('/finance/stats', { params }),
  getDashboard: () => api.get('/finance/dashboard'),
  approve: (id) => api.post(`/finance/${id}/approve`)
};

// Sponsors API
export const sponsorsAPI = {
  getAll: (params) => api.get('/sponsors', { params }),
  getById: (id) => api.get(`/sponsors/${id}`),
  create: (data) => api.post('/sponsors', data),
  update: (id, data) => api.put(`/sponsors/${id}`, data),
  delete: (id) => api.delete(`/sponsors/${id}`),
  getStats: () => api.get('/sponsors/stats'),
  addPayment: (id, data) => api.post(`/sponsors/${id}/payments`, data)
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getMy: (params) => api.get('/attendance/my', { params }),
  getStats: () => api.get('/attendance/stats'),
  getToday: () => api.get('/attendance/today'),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.put('/attendance/checkout', data)
};

// Marketing API
export const marketingAPI = {
  getCampaigns: () => api.get('/marketing/campaigns'),
  getAnalytics: () => api.get('/marketing/analytics'),
  createCampaign: (data) => api.post('/marketing/campaigns', data)
};

// Reports API
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  addReview: (id, data) => api.post(`/reports/${id}/review`, data),
  publish: (id) => api.post(`/reports/${id}/publish`)
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDashboard: () => api.get('/admin/dashboard'),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  getSystemInfo: () => api.get('/admin/system-info')
};

export default api;
