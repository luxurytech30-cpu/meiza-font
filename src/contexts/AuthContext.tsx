import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, clearToken } from "@/lib/api";

type User = {
  _id: string;
  name: string;
  username: string;
  roles: string[];
  isActive?: boolean;
  
};
type Ctx = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // addgg
};
const BASE = import.meta.env.VITE_API_URL;
const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUser() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
        setUser(payload.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // in AuthContext
  async function login(username: string, password: string) {
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
      
      setToken(payload.token);
      setUser(payload.user);
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  }

  async function register(name: string, username: string, password: string) {
    try {
      console.log("before");
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }), // no roles
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log("after");
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    }
  }

  function logout() {
    try {
      clearToken();
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout,setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
