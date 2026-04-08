import axios from 'axios';

// 1. Create a centralized Axios hub
// This prevents us from having to type 'http://localhost:5001' on every single page!
const api = axios.create({
  // In dev it uses localhost. In production (Vercel), it uses your Render link!
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// 2. The Golden Rule of Protected Backend Routes: The Interceptor
// Before ANY Axios request leaves the React app, this code catches it mid-air,
// pulls the strict JWT string out of the browser's persistent storage, 
// and glues it to the 'Authorization' Header for the backend Bouncer to read!
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: Catch global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If the token is expired or invalid, kick them out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
