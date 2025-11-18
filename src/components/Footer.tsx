import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-gradient-gold mb-4">
              MEIZA HERITAGE
            </h3>
            <p className="text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {t("footer.links")}
            </h4>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              <Link to="/" className="text-muted-foreground hover:text-accent transition-colors">
                {t("nav.home")}
              </Link>
              <Link to="/products" className="text-muted-foreground hover:text-accent transition-colors">
                {t("nav.products")}
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
                {t("nav.about")}
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors">
                {t("nav.contact")}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">
              {t("footer.contact")}
            </h4>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <p>MRCAZA17@GMAIL.COM</p>
              <p>0544689375</p>
              <p>Afula, Israel</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>
            &copy; {new Date().getFullYear()} MEIZA HERITAGE PREMIUM. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
