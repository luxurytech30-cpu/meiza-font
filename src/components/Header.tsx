import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Globe,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = totalItems;

  const toggleLanguage = () => setLanguage(language === "en" ? "he" : "en");
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  const txt = {
    login: language === "he" ? "כניסה" : "Login",
    register: language === "he" ? "הרשמה" : "Register",
    logout: language === "he" ? "יציאה" : "Logout",
    admin: language === "he" ? "ניהול" : "Admin",
    profile: language === "he" ? "פרופיל " : "Profile",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav
        className="container mx-auto px-4 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-serif font-bold text-gradient-gold hover:opacity-80 transition-opacity"
            onClick={closeMobile}
          >
            MEIZA HERITAGE
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/products"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("nav.products")}
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-accent transition-colors"
            >
              {t("nav.contact")}
            </Link>
            {user && (
              <Link
                to="/profile"
                className="text-foreground hover:text-accent transition-colors"
              >
                {txt.profile}
              </Link>
            )}
            {user?.roles?.includes("admin") && (
              <Link
                to="/admin"
                className="text-foreground hover:text-accent transition-colors"
              >
                {txt.admin}
              </Link>
            )}
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              aria-label={`Switch to ${language === "en" ? "Hebrew" : "English"}`}
            >
              <Globe className="h-5 w-5" />
            </Button>

            <Link
              to="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 opacity-70" />
                <span className="max-w-[120px] truncate">{user.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  aria-label={txt.logout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {txt.logout}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button size="sm" aria-label={txt.login}>
                    <LogIn className="h-4 w-4 mr-1" />
                    {txt.login}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm" aria-label={txt.register}>
                    {txt.register}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile controls (right side) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Cart icon */}
            <Link
              to="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              onClick={closeMobile}
            >
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Theme + language quick toggles (optional) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobile}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t border-border pt-3 space-y-3">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="py-1 text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/products"
                className="py-1 text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.products")}
              </Link>
              <Link
                to="/about"
                className="py-1 text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="py-1 text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.contact")}
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className="py-1 text-foreground hover:text-accent transition-colors"
                  onClick={closeMobile}
                >
                  {txt.profile}
                </Link>
              )}
              {user?.roles?.includes("admin") && (
                <Link
                  to="/admin"
                  className="py-1 text-foreground hover:text-accent transition-colors"
                  onClick={closeMobile}
                >
                  {txt.admin}
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
              {/* Language */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex-1 mr-2"
                aria-label={`Switch to ${
                  language === "en" ? "Hebrew" : "English"
                }`}
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === "en" ? "עברית" : "English"}
              </Button>

              {/* Auth buttons */}
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  aria-label={txt.logout}
                  className="flex-1"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {txt.logout}
                </Button>
              ) : (
                <div className="flex flex-1 gap-2">
                  <Link to="/login" className="flex-1" onClick={closeMobile}>
                    <Button size="sm" className="w-full" aria-label={txt.login}>
                      <LogIn className="h-4 w-4 mr-1" />
                      {txt.login}
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1"
                    onClick={closeMobile}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      aria-label={txt.register}
                    >
                      {txt.register}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-2 pt-2">
                <UserIcon className="h-4 w-4 opacity-70" />
                <span className="text-sm truncate">{user.name}</span>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
