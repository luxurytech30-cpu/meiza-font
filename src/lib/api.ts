import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

// ---------------------
// Guest Cart ID
// ---------------------
function getGuestId() {
  let id = localStorage.getItem("guestCartId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("guestCartId", id);
  }
  return id;
}

// ---------------------
// Token helpers
// ---------------------
export const getToken = () => localStorage.getItem("token") || "";
export const setToken = (t: string) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

// ---------------------
// Axios instance
// ---------------------
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ---------------------
// Interceptor – add auth + guest
// ---------------------
api.interceptors.request.use((cfg) => {
  cfg.headers = cfg.headers || {};

  // Always send guest ID
  cfg.headers["x-guest-id"] = getGuestId();

  // Add token only if exists
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;

  return cfg;
});
