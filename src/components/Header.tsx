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
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <Link
            to="/"
            className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gradient-gold hover:opacity-80 transition-opacity"
            onClick={closeMobile}
          >
            MEIZA HERITAGE
          </Link>

          {/* Desktop nav (lg and up) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8">
            <Link
              to="/"
              className="text-sm xl:text-base text-foreground hover:text-accent transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/products"
              className="text-sm xl:text-base text-foreground hover:text-accent transition-colors"
            >
              {t("nav.products")}
            </Link>
            <Link
              to="/about"
              className="text-sm xl:text-base text-foreground hover:text-accent transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              to="/contact"
              className="text-sm xl:text-base text-foreground hover:text-accent transition-colors"
            >
              {t("nav.contact")}
            </Link>
            {user && (
              <Link
                to="/profile"
                className="text-sm xl:text-base text-foreground hover:text-accent transition-colors"
              >
                {txt.profile}
              </Link>
            )}
            {user?.roles?.includes("admin") && (
              <Link
                to="/admin"
                className="text-sm xl:text-base text-foreground hover:text-accent transition-colors"
              >
                {txt.admin}
              </Link>
            )}
          </div>

          {/* Right-side controls: cart + theme + auth + mobile menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cart */}
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

             {/* Desktop language toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              aria-label={`Switch to ${
                language === "en" ? "Hebrew" : "English"
              }`}
              className="hidden lg:inline-flex"
            >
              <Globe className="h-5 w-5" />
            </Button>

            {/* Theme toggle */}
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

            {/* Desktop auth buttons */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <span className="hidden xl:inline text-sm max-w-[140px] truncate">
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  aria-label={txt.logout}
                  className="text-sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {txt.logout}
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={txt.login}
                    className="text-sm"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    {txt.login}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label={txt.register}
                    className="text-sm"
                  >
                    {txt.register}
                  </Button>
                </Link>
              </div>
            )}

            {/* Menu button – mobile/tablet ONLY */}
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1 text-xs sm:text-sm lg:hidden"
              onClick={toggleMobile}
              aria-label="Toggle menu"
            >
              {mobileOpen ? "Close" : "Menu"}
            </Button>
          </div>
        </div>

        {/* Mobile / tablet menu panel */}
        {mobileOpen && (
          <div className="mt-2 sm:mt-3 border-t border-border pt-3 space-y-3 lg:hidden">
            <div className="flex flex-col gap-1.5">
              <Link
                to="/"
                className="py-1.5 text-sm text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/products"
                className="py-1.5 text-sm text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.products")}
              </Link>
              <Link
                to="/about"
                className="py-1.5 text-sm text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="py-1.5 text-sm text-foreground hover:text-accent transition-colors"
                onClick={closeMobile}
              >
                {t("nav.contact")}
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className="py-1.5 text-sm text-foreground hover:text-accent transition-colors"
                  onClick={closeMobile}
                >
                  {txt.profile}
                </Link>
              )}
              {user?.roles?.includes("admin") && (
                <Link
                  to="/admin"
                  className="py-1.5 text-sm text-foreground hover:text-accent transition-colors"
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
                className="flex-1 mr-2 text-sm"
                aria-label={`Switch to ${
                  language === "en" ? "Hebrew" : "English"
                }`}
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === "en" ? "עברית" : "English"}
              </Button>

              {/* Auth buttons (mobile) */}
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  aria-label={txt.logout}
                  className="flex-1 text-sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {txt.logout}
                </Button>
              ) : (
                <div className="flex flex-1 gap-2">
                  <Link to="/login" className="flex-1" onClick={closeMobile}>
                    <Button
                      size="sm"
                      className="w-full text-sm"
                      aria-label={txt.login}
                    >
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
                      className="w-full text-sm"
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
