import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import heroImage from "@/assets/hero-home.jpg";
import heroImage2 from "@/assets/product-bowl.jpg";  
import heroImage3 from "@/assets/product-candles.jpg";
import aboutImage from "@/assets/about-heritage.jpg";
import type { Product } from "@/types/product";
import { useEffect, useMemo, useState } from "react";

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
    const heroImages = [heroImage, heroImage2, heroImage3];
  const [heroIndex, setHeroIndex] = useState(0);

 useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // 6s per slide
    return () => clearInterval(id);
  }, [heroImages.length]);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${7 + Math.random() * 6}s`,
        size: `${6 + Math.random() * 10}px`,
      })),
    []
  );
  return (
   <main className="min-h-screen overflow-x-hidden">
  {/* Hero */}
  <section
    className="relative w-full h-[90vh] sm:h-screen flex items-center justify-center overflow-hidden"
    aria-label="Hero section"
  >
    <div className="absolute inset-0">
      {heroImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="Luxury home interior"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${
            heroIndex === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-overlay" />
    </div>

    {/* moving particles */}
    <div className="pointer-events-none absolute inset-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/40 mix-blend-screen"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `hero-float ${p.duration} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>

    <div className="relative z-10 text-center px-4 max-w-xl sm:max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-4 text-foreground leading-tight">
        {t("home.hero.title")}
      </h1>
      <p className="text-base sm:text-lg md:text-2xl mb-8 text-muted-foreground">
        {t("home.hero.subtitle")}
      </p>
      <Link to="/products">
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-gold"
        >
          {t("home.hero.cta")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>

    <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      {heroImages.map((_, i) => (
        <button
          key={i}
          onClick={() => setHeroIndex(i)}
          className={`h-2 w-4 sm:h-3 sm:w-3 rounded-full transition-all ${
            heroIndex === i ? "bg-accent w-6 sm:w-8" : "bg-white/50 hover:bg-white"
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  </section>

  {/* Featured */}
  <section
    className="w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20 animate-slide-up"
    aria-labelledby="featured-heading"
  >
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10 sm:mb-12">
        <h2
          id="featured-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground"
        >
          {t("home.featured.title")}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("home.featured.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              className="h-72 sm:h-80 md:h-96 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {featured != null &&
            featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      <div className="text-center">
        <Link to="/products">
          <Button
            variant="outline"
            size="lg"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
          >
            {t("home.featured.viewAll")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </section>

  {/* Brand Story */}
  <section
    className="w-full bg-card py-14 sm:py-20"
    aria-labelledby="story-heading"
  >
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2
            id="story-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground"
          >
            {t("home.story.title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
            {t("home.story.description")}
          </p>
          <Link to="/about">
            <Button
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
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
            className="w-full h-64 sm:h-80 md:h-[500px] object-cover shadow-elegant rounded-2xl"
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
