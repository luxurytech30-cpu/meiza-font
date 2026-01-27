// Products.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";

const KEY_LAST_ID = "products:lastId";
const KEY_SCROLLY = "products:scrollY";
const KEY_SHOULD_RESTORE = "products:restore";
const KEY_CATEGORY = "products:category";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // restore category (optional)
  useEffect(() => {
    const savedCat = sessionStorage.getItem(KEY_CATEGORY);
    if (savedCat) setSelectedCategory(savedCat);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(KEY_CATEGORY, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([api.get("/products"), api.get("/categories")]);
        setProducts(p.data || []);
        setCategories(c.data || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => {
      const cid = typeof p.category === "string" ? p.category : p.category?._id;
      return cid === selectedCategory;
    });
  }, [products, selectedCategory]);

  // restore scroll AFTER data is loaded and DOM rendered
  useEffect(() => {
    if (loading) return;

    const shouldRestore = sessionStorage.getItem(KEY_SHOULD_RESTORE) === "1";
    if (!shouldRestore) return;

    // only restore once
    sessionStorage.removeItem(KEY_SHOULD_RESTORE);

    // wait for the grid to render
    requestAnimationFrame(() => {
      const lastId = sessionStorage.getItem(KEY_LAST_ID);
      if (lastId) {
        const el = document.getElementById(`product-${lastId}`);
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "auto" });
          return;
        }
      }

      // fallback: restore scrollY
      const y = Number(sessionStorage.getItem(KEY_SCROLLY) || "0");
      if (!Number.isNaN(y)) window.scrollTo({ top: y, behavior: "auto" });
    });
  }, [loading, selectedCategory, filteredProducts.length]);

  function rememberPosition(productId: string) {
    sessionStorage.setItem(KEY_LAST_ID, productId);
    sessionStorage.setItem(KEY_SCROLLY, String(window.scrollY));
    sessionStorage.setItem(KEY_SHOULD_RESTORE, "1");
  }

  if (loading) return <main className="pt-24 pb-20 container mx-auto px-4">Loading products...</main>;
  if (error) return <main className="pt-24 pb-20 container mx-auto px-4">Error: {error}</main>;

  return (
    <main className="min-h-screen overflow-x-hidden pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-center mb-8 sm:mb-12">
          {language === "en" ? "Products" : "מוצרים"}
        </h1>

        {/* Category filters */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto pb-1 justify-start sm:justify-center">
            <button
              className={`px-4 py-2 rounded-full border text-sm sm:text-base whitespace-nowrap transition-colors duration-150 ${
                selectedCategory === "all"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              {language === "en" ? "All" : "הכל"}
            </button>

            {categories.map((c) => (
              <button
                key={c._id}
                className={`px-4 py-2 rounded-full border text-sm sm:text-base whitespace-nowrap transition-colors duration-150 ${
                  selectedCategory === c._id
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
                onClick={() => setSelectedCategory(c._id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8" id="products-grid">
          {filteredProducts.map((p) => (
            <div key={p._id} id={`product-${p._id}`}>
              <ProductCard product={p} onOpen={() => rememberPosition(p._id)} />
            </div>
          ))}
        </div>

        {!filteredProducts.length && (
          <p className="text-center text-muted-foreground text-sm sm:text-lg mt-10 sm:mt-12">
            {language === "en" ? "No products found in this category." : "לא נמצאו מוצרים בקטגוריה זו."}
          </p>
        )}
      </div>
    </main>
  );
}
