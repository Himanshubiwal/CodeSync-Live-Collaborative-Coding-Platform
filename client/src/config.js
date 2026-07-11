// Centralized backend URL config for all API and Socket.IO calls.
// In development: defaults to http://localhost:3001
// In production: set VITE_BACKEND_URL env variable to your Render server URL.
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
