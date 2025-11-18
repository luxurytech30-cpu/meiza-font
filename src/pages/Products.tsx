import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Product, Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {language}=useLanguage()
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
    return products.filter(p => {
      const cid = typeof p.category === "string" ? p.category : p.category?._id;
      return cid === selectedCategory;
    });
  }, [products, selectedCategory]);

  if (loading) return <main className="pt-24 pb-20 container mx-auto px-4">Loading products...</main>;
  if (error) return <main className="pt-24 pb-20 container mx-auto px-4">Error: {error}</main>;

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-center mb-12">{language==='en'?'Products':'מוצרים'}</h1>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            className={`px-4 py-2 rounded-full border ${selectedCategory === "all" ? "bg-black text-white" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            {language==='en'?'All':'הכל'}
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              className={`px-4 py-2 rounded-full border ${selectedCategory === c._id ? "bg-black text-white" : ""}`}
              onClick={() => setSelectedCategory(c._id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="products-grid" role="tabpanel">
          {filteredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>

        {!filteredProducts.length && (
          <p className="text-center text-muted-foreground text-lg mt-12">No products found in this category.</p>
        )}
      </div>
    </main>
  );
}
