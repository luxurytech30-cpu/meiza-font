import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

function getGuestId() {
  let id = localStorage.getItem("guestCartId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("guestCartId", id);
  }
  return id;
}

export const getToken = () => localStorage.getItem("token") || "";
export const setToken = (t: string) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  if (!cfg.headers) cfg.headers = {};

  (cfg.headers as any)["x-guest-id"] = getGuestId();

  const token = getToken();
  if (token) (cfg.headers as any).Authorization = `Bearer ${token}`;

  return cfg;
});
