/**
 * API Client — single axios instance.
 * Switch between mock and real by setting VITE_API_BASE_URL in .env
 * When unset or empty, the mock layer is used instead.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Add auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pigeon_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const isUsingMockApi = !BASE_URL;
