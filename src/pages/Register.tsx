// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const { language } = useLanguage();
  const rtl = language === "he";
  const L = (en: string, he: string) => (rtl ? he : en);

  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [sub, setSub] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSub(true);
    try {
      await register(name, username, password);
      nav("/");
    } catch (e: any) {
      setErr(e?.message || L("Registration failed", "ההרשמה נכשלה"));
    } finally {
      setSub(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md mt-28 p-6 border rounded-xl" dir={rtl ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-semibold mb-4">{L("Register", "הרשמה")}</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div>
          <Label htmlFor="name">{L("Full name", "שם מלא")}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button type="submit" disabled={sub}>
          {sub ? "..." : L("Create account", "צור חשבון")}
        </Button>
      </form>

      <p className="mt-3 text-sm">
        {L("Already have an account?", "כבר יש לך חשבון?")}{" "}
        <Link to="/login" className="text-accent underline">
          {L("Login", "התחברות")}
        </Link>
      </p>
    </div>
  );
}
