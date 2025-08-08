// utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', // for vercel proxying
});

instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default instance;