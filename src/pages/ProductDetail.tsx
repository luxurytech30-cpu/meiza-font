import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import QuantityStepper from "@/components/QuantityStepper";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product, Option } from "@/types/product";

function text(v: any, lang: "en" | "he") {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[lang] ?? v.en ?? "";
}
function formatSaleEnd(end?: string, lang: "en" | "he" = "en") {
  if (!end) return "";
  const d = new Date(end);
  if (Number.isNaN(d.getTime())) return "";
  const locale = lang === "he" ? "he-IL" : "en-IL";
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}
function isSaleActive(o?: Option) {
  if (!o) return false;
  if (o.sale?.price == null) return false;
  const now = new Date();
  if (o.sale?.start && new Date(o.sale.start) > now) return false;
  if (o.sale?.end && new Date(o.sale.end)   < now) return false;
  return true;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [opt, setOpt] = useState<Option | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.get(`/products/${id}`);
        if (!mounted) return;
        const p: Product = r.data;
        setProduct(p);
        setOpt(p.options?.find(o => o.isDefault) || p.options?.[0] || null);
      } catch (e: any) {
        setErr(e?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const isVip =
    !!user && Array.isArray((user as any).roles) && (user as any).roles.includes("vip");

  const title = text((product as any)?.name, language as "en" | "he");
  const desc  = text((product as any)?.desc, language as "en" | "he");

  // selected image: option image -> product image -> placeholder
  const imageSrc = useMemo(() => {
    const src = (opt?.img && opt.img.trim() !== "") ? opt.img : (product as any)?.img;
    return src || "/placeholder.svg";
  }, [opt?.img, (product as any)?.img]);

  const imageAlt = useMemo(
    () =>
      `${title}${opt ? " – " + text(opt.name, language as "en" | "he") : ""}`.trim(),
    [title, opt, language]
  );

  // Build a cart quantity map to avoid repeated scans
  const cartQtyByKey = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of cart) {
      const key = `${i.product}|${i.optionId ?? i.optionName ?? ""}`;
      m.set(key, (m.get(key) ?? 0) + (i.quantity ?? 0));
    }
    return m;
  }, [cart]);

  const optKey = useMemo(
    () => `${product?._id ?? ""}|${(opt as any)?._id ?? (opt as any)?.name ?? ""}`,
    [product?._id, opt?._id, opt?.name]
  );

  // Pricing
  const saleActiveForCustomer = useMemo(
    () => !isVip && isSaleActive(opt || undefined),
    [isVip, opt]
  );
  const base = useMemo(() => (opt ? Number(opt.price) : 0), [opt]);
  const vip  = useMemo(() => (opt && opt.vipPrice != null ? Number(opt.vipPrice) : null), [opt]);
  const sale = useMemo(() => (opt?.sale?.price != null ? Number(opt.sale!.price) : null), [opt]);
  const displayPrice = useMemo(
    () => (isVip ? (vip ?? base) : saleActiveForCustomer && sale != null ? sale : base),
    [isVip, vip, base, saleActiveForCustomer, sale]
  );

  // already in cart and stock
  const currentInCart = cartQtyByKey.get(optKey) ?? 0;
  const stock = useMemo(() => (opt?.quantity ?? undefined), [opt]);
  const remaining = useMemo(() => {
    if (stock == null) return Infinity;
    return Math.max(0, stock - currentInCart);
  }, [stock, currentInCart]);

  // clamp qty if remaining changes
  useEffect(() => {
    setQty((q) => {
      if (remaining === Infinity) return Math.max(1, q || 1);
      return Math.min(Math.max(1, q || 1), remaining);
    });
  }, [remaining, opt?._id]);

  const canAdd = !!opt && remaining > 0 && !adding;

  function handleAdd() {
    if (!user) { nav(`/login?next=/products/${id}`); return; }
    if (!product || !opt) return;
    if (remaining <= 0) return;

    setAdding(true);
    const p = addToCart(product, opt, qty);
    Promise.resolve(p).finally(() => setAdding(false));
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">Loading…</div>
      </main>
    );
  }
  if (err || !product) {
    return (
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Product Not Found</h1>
          <Link to="/products">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="mr-2 h-5 w-5" />
              {language==='en'?'Back to Products':'חזרה למוצרים' }
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
<main className="min-h-screen overflow-x-hidden pt-20 sm:pt-24 pb-16 sm:pb-20">
  <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <Link
      to="/products"
      className="inline-flex items-center text-sm sm:text-base text-accent hover:text-accent/80 mb-6 sm:mb-8"
    >
      <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
      {language === "en" ? "Back to Products" : "חזרה למוצרים"}
    </Link>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image */}
      <div className="aspect-[4/3] sm:aspect-square overflow-hidden bg-secondary relative rounded-xl sm:rounded-2xl">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        {!isVip && opt && isSaleActive(opt) && (
          <span className="absolute left-3 top-3 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full bg-accent text-accent-foreground shadow-gold">
            {language === "he" ? "מבצע" : "Sale"}
          </span>
        )}
        {remaining === 0 && (
          <span className="absolute right-3 top-3 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full bg-destructive text-destructive-foreground">
            {language === "he" ? "אזל מהמלאי" : "Sold out"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center mt-4 lg:mt-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-foreground leading-tight">
          {title}
        </h1>

        {/* Price block */}
        {isVip ? (
          <div className="mb-6 sm:mb-8 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-semibold text-accent">
              ₪{(vip ?? base).toLocaleString()}
            </span>
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border border-accent text-accent">
              VIP
            </span>
          </div>
        ) : saleActiveForCustomer && sale != null ? (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-baseline gap-3">
              <span className="text-sm sm:text-base text-muted-foreground line-through">
                ₪{base.toLocaleString()}
              </span>
              <span className="text-2xl sm:text-3xl font-semibold text-accent">
                ₪{sale.toLocaleString()}
              </span>
            </div>
            {opt?.sale?.end && (
              <div className="text-xs text-muted-foreground mt-1">
                {language === "he" ? "מבצע עד" : "Ends"}{" "}
                {formatSaleEnd(opt.sale.end, language as "en" | "he")}
              </div>
            )}
          </div>
        ) : (
          <p className="text-2xl sm:text-3xl font-semibold text-accent mb-6 sm:mb-8">
            ₪{displayPrice.toLocaleString()}
          </p>
        )}

        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 border-border">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">
            {language === "he" ? "תיאור" : "Description"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
            {desc ? desc : language === "en" ? "no descripton" : "אין תיאור"}
          </p>

          {/* Options with thumbnails */}
          {product.options?.length > 0 && (
            <div className="mt-2 space-y-2">
              <span className="font-semibold text-foreground block text-sm sm:text-base">
                {language === "he" ? "אפשרות" : "Option"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[220px] sm:min-w-[240px] justify-between"
                  >
                    <span className="inline-flex items-center gap-2 truncate">
                      {opt?.img ? (
                        <img
                          src={opt.img}
                          alt={text(opt?.name, language as "en" | "he")}
                          className="h-6 w-6 rounded object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : null}
                      {opt
                        ? text(opt.name, language as "en" | "he")
                        : language === "he"
                        ? "בחר אפשרות"
                        : "Choose option"}
                    </span>
                    <span className="opacity-60 text-xs sm:text-sm">▾</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 sm:w-72">
                  <DropdownMenuLabel>
                    {language === "he" ? "בחר אפשרות" : "Select option"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {product.options.map((o: any) => {
                    const oKey = `${product._id}|${o._id ?? o.name ?? ""}`;
                    const inCart = cartQtyByKey.get(oKey) ?? 0;
                    const stockOpt = o.quantity ?? undefined;
                    const remainingOpt =
                      stockOpt == null
                        ? Infinity
                        : Math.max(0, stockOpt - inCart);
                    const label = text(o.name, language as "en" | "he");
                    const soldOut = remainingOpt === 0;

                    return (
                      <DropdownMenuItem
                        key={o._id ?? label}
                        className={
                          soldOut ? "opacity-50 pointer-events-none" : ""
                        }
                        onClick={() => setOpt(o)}
                      >
                        <div className="flex w-full items-center gap-2">
                          {o.img ? (
                            <img
                              src={o.img}
                              alt={label}
                              className="h-8 w-8 rounded object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-muted" />
                          )}
                          <span className="truncate text-sm sm:text-base">
                            {label}
                          </span>
                          {remainingOpt !== Infinity && (
                            <span className="ml-auto text-[11px] sm:text-xs tabular-nums">
                              {remainingOpt}{" "}
                              {language === "he" ? "נותרו" : "left"}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Remaining */}
          <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
            {remaining === Infinity
              ? language === "he"
                ? "במלאי"
                : "In stock"
              : remaining > 0
              ? language === "he"
                ? `נותרו: ${remaining}`
                : `Remaining: ${remaining}`
              : language === "he"
              ? "אזל מהמלאי"
              : "Sold out"}
          </div>
        </Card>

        {/* Qty */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <label className="text-sm font-medium">
            {language === "he" ? "כמות" : "Qty"}
          </label>
          <QuantityStepper
            value={qty}
            onChange={setQty}
            min={1}
            max={remaining === Infinity ? undefined : remaining}
          />
        </div>

        <Button
          onClick={handleAdd}
          disabled={!opt || remaining <= 0 || adding}
          size="lg"
          className="w-full max-w-md text-base sm:text-lg py-4 sm:py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold disabled:opacity-60"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {adding
            ? language === "he"
              ? "מוסיף..."
              : "Adding…"
            : language === "he"
            ? "הוסף לעגלה"
            : "Add to cart"}
        </Button>
      </div>
    </div>
  </div>
</main>


  );
}
