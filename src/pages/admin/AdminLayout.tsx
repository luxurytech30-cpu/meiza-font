// pages/admin/AdminLayout.tsx
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
// ✅ adjust this import to your real auth context
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout() {
  const { language } = useLanguage();
  const { user } = useAuth(); // { role: "admin" | "user" | ... }
  const location = useLocation();
  const rtl = language === "he";
  const L = (en: string, he: string) => (rtl ? he : en);

  // ======== FRONTEND GUARD =========
  if (!user) {
    // not logged in → go to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.roles.includes("admin")) {
    // logged in but not admin → block admin area
    return <Navigate to="/" replace />;
  }
  // ================================

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded whitespace-nowrap text-sm md:text-base
     hover:bg-accent hover:text-accent-foreground
     ${isActive ? "bg-accent text-accent-foreground" : ""}`;

  return (
    <div
      className="min-h-screen pt-16 bg-background"
      dir={rtl ? "rtl" : "ltr"}
      key={language}
    >
      {/* DESKTOP SIDEBAR (md and up) */}
      <aside
        className={`hidden md:block fixed top-16 bottom-0 w-60 p-4 space-y-3 bg-background
        ${rtl ? "right-0 border-l border-border" : "left-0 border-r border-border"}`}
      >
        <h2 className="text-xl font-semibold mb-2">
          {L("Admin", "מנהל מערכת")}
        </h2>
        <nav className="flex flex-col gap-1">
          <NavLink to="products" className={link}>
            {L("Products", "מוצרים")}
          </NavLink>
          <NavLink to="categories" className={link}>
            {L("Categories", "קטגוריות")}
          </NavLink>
          <NavLink to="users" className={link}>
            {L("Users", "משתמשים")}
          </NavLink>
          <NavLink to="orders" className={link}>
            {L("Orders", "הזמנות")}
          </NavLink>
        </nav>
      </aside>

      {/* MOBILE TOP NAV (phones) */}
      <div className="md:hidden sticky top-16 z-40 bg-background/95 border-b border-border backdrop-blur-sm">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold mb-2">
            {L("Admin Panel", "ממשק ניהול")}
          </h2>
          <nav
            className={`flex gap-2 overflow-x-auto pb-1 ${
              rtl ? "flex-row-reverse" : ""
            }`}
          >
            <NavLink to="products" className={link}>
              {L("Products", "מוצרים")}
            </NavLink>
            <NavLink to="categories" className={link}>
              {L("Categories", "קטגוריות")}
            </NavLink>
            <NavLink to="users" className={link}>
              {L("Users", "משתמשים")}
            </NavLink>
            <NavLink to="orders" className={link}>
              {L("Orders", "הזמנות")}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* CONTENT */}
      <main
        className={`
          p-4 md:p-6
          mt-2 md:mt-0
          ${rtl ? "md:mr-60" : "md:ml-60"}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}
