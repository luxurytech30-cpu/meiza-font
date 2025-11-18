import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import heroImage from "@/assets/hero-home.jpg";
import aboutImage from "@/assets/about-heritage.jpg";
import type { Product } from "@/types/product";

async function fetchFeatured(): Promise<Product[]> {
  // Try server-side featured
  const r = await api.get("/products", {
    params: { featured: true, limit: 3 },
  });
  let list: Product[] = Array.isArray(r.data?.items) ? r.data.items : r.data;
  if (!Array.isArray(list)) list = [];
  // Fallback: take first 3 if server doesn’t support ?featured
  if (list.length === 0) {
    const r2 = await api.get("/products", { params: { limit: 3 } });
    const all: Product[] = Array.isArray(r2.data?.items)
      ? r2.data.items
      : r2.data || [];
    return all.slice(0, 3);
  }
  return list.slice(0, 3);
}

const Home = () => {
  const { t } = useLanguage();
  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeatured,
    staleTime: 60_000,
  });

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        aria-label="Hero section"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury home interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-overlay"></div>
        </div>

        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-4 text-foreground">
            {t("home.hero.title")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
            {t("home.hero.subtitle")}
          </p>
          <Link to="/products">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 shadow-gold"
            >
              {t("home.hero.cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section
        className="container mx-auto px-4 py-20 animate-slide-up"
        aria-labelledby="featured-heading"
      >
        <div className="text-center mb-12">
          <h2
            id="featured-heading"
            className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground"
          >
            {t("home.featured.title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("home.featured.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                className="h-96 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featured != null &&
              featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        <div className="text-center">
          <Link to="/products">
            <Button
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              {t("home.featured.viewAll")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-card py-20" aria-labelledby="story-heading">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2
                id="story-heading"
                className="text-4xl font-serif font-bold mb-6 text-foreground"
              >
                {t("home.story.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("home.story.description")}
              </p>
              <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  {t("home.story.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src={aboutImage}
                alt="MEIZA HERITAGE craftsmanship"
                className="w-full h-[500px] object-cover shadow-elegant"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
