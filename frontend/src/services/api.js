import axios from 'axios';

// Default to backend on port 8000 if not specified by env or proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to fall back to port 8000 directly if relative URL proxy fails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the request fails due to relative URL proxy issues in dev environments
    if (!API_BASE_URL && (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error'))) {
      const fallbackUrl = 'http://localhost:8000';
      const config = {
        ...error.config,
        baseURL: fallbackUrl,
      };
      // Retry once with the fallback absolute url
      return axios(config);
    }
    return Promise.reject(error);
  }
);

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getZonesList = async () => {
  const response = await api.get('/zones');
  return response.data;
};

export const analyzeTelemetry = async (payload) => {
  const response = await api.post('/analyze', payload);
  return response.data;
};
