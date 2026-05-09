import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
