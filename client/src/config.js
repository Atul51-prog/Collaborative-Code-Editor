// Centralized configuration for backend API and WebSocket endpoints
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD
    ? 'https://syncode-backend-mcz4.onrender.com'
    : '');
