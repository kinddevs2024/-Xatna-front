// API configuration
// For local development: http://localhost:3000
// For production: https://your-backend-domain.com
const LOCAL_BASE_URL = "http://localhost:3000";
const PRODUCTION_BASE_URL = "https://xatna-beck.vercel.app";

// Use environment variable or default to production
const BASE_URL = import.meta.env.VITE_BASE_URL || PRODUCTION_BASE_URL;

// Log for debugging
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  MODE: import.meta.env.MODE
});

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${BASE_URL}/api`;
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || BASE_URL;
export const SERVICES_BASE_URL =
  import.meta.env.VITE_SERVICES_BASE_URL || BASE_URL;
export const BARBERS_BASE_URL =
  import.meta.env.VITE_BARBERS_BASE_URL || BASE_URL;
export const BOOKINGS_BASE_URL =
  import.meta.env.VITE_BOOKINGS_BASE_URL || BASE_URL;
export const POSTS_BASE_URL =
  import.meta.env.VITE_POSTS_BASE_URL || BASE_URL;

// Socket.IO URL - по умолчанию отдельный WebSocket сервер на порту 3003
const WS_LOCAL = "http://localhost:3003";
const WS_PRODUCTION = "https://ws.001barbershop.uz";

export const SOCKET_IO_URL =
  import.meta.env.VITE_SOCKET_IO_URL || 
  (import.meta.env.MODE === 'production' ? WS_PRODUCTION : WS_LOCAL);

export const API_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  users: "/users",
  barbers: "/users/barbers",
  // Role-specific user creation endpoints
  createAdmin: "/admin",
  createBarber: "/barber",
  createClient: "/client",
  services: "/barber-services",
  serviceCategories: "/service-categories",
  bookings: "/bookings",
  bookingsMy: "/bookings/my",
  bookingsMultiple: "/bookings/multiple",
  bookingsPending: "/bookings/pending",
  bookingsClient: "/bookings/client",
  bookingsBarber: "/bookings/barber",
  bookingsStatistics: "/bookings/admin/statistics",
  bookingApprove: "/bookings",
  bookingReject: "/bookings",
  bookingStatus: "/bookings",
  comments: "/bookings/comments",
  broadcastPost: "/posts/broadcast",
};
