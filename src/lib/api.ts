import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getToken = () => localStorage.getItem("token") || "";
export const setToken  = (t: string) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
