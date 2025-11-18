import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const sendVerificationCode = async (email: string) => {
  const response = await api.post('/api/send-verification', { email });
  return response.data;
};

export const verifyCode = async (email: string, code: string) => {
  const response = await api.post('/api/verify-code', { email, code });
  return response.data;
};

// Dashboard APIs
export const getStats = async () => {
  const response = await api.get('/api/stats');
  return response.data;
};

// Students APIs
export const getStudents = async () => {
  const response = await api.get('/api/students');
  return response.data;
};

export const getStudentById = async (id: string) => {
  const response = await api.get(`/api/students/${id}`);
  return response.data;
};

// Attendance APIs
export const recordAttendance = async (attendanceData: any) => {
  const response = await api.post('/api/attendance/record', attendanceData);
  return response.data;
};

// Results APIs
export const updateResults = async (resultsData: any) => {
  const response = await api.post('/api/results/update', resultsData);
  return response.data;
};

// Teacher APIs
export const getTeacherProfile = async () => {
  const response = await api.get('/api/teacher/me');
  return response.data;
};

export const updateTeacherProfile = async (profileData: any) => {
  const response = await api.put('/api/teacher/me', profileData);
  return response.data;
};

export default api;
