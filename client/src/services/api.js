import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const skipAuthRedirect = Boolean(error.config?.skipAuthRedirect);
    const isAuthUserCheck = requestUrl.includes('/auth/user');
    const isAuthPage = ['/login', '/signup'].includes(window.location.pathname);

    if (status === 401 && !skipAuthRedirect && !isAuthUserCheck && !isAuthPage) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
