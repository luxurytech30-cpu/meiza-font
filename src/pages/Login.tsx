// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { language } = useLanguage();
  const rtl = language === "he";
  const L = (en: string, he: string) => (rtl ? he : en);

  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [sub, setSub] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSub(true);
    try {
      await login(username, password);
      nav(loc.state?.from?.pathname || "/");
    } catch (e: any) {
      setErr(e?.message || L("Login failed", "ההתחברות נכשלה"));
    } finally {
      setSub(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md mt-28 p-6 border rounded-xl" dir={rtl ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold mb-4">{L("Login", "התחברות")}</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <Label htmlFor="username">{L("Username", "שם משתמש")}</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            inputMode="text"
            autoComplete="username"
          />
        </div>

        <div>
          <Label htmlFor="password">{L("Password", "סיסמה")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button type="submit" disabled={sub}>
          {sub ? "..." : L("Login", "התחברות")}
        </Button>
      </form>

      <p className="mt-3 text-sm">
        {L("No account?", "אין לך חשבון?")}{" "}
        <Link to="/register" className="text-accent underline">
          {L("Register", "הרשמה")}
        </Link>
      </p>
    </div>
  );
}
