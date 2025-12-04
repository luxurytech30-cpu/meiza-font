// src/components/ProductCard.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Product, Option } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function tText(v: any, lang: "en" | "he") {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[lang] ?? v.en ?? "";
}

function formatSaleEnd(end?: string, lang: "en" | "he" = "en") {
  if (!end) return "";
  const d = new Date(end);
  if (Number.isNaN(d.getTime())) return "";
  const locale = lang === "he" ? "he-IL" : "en-IL";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isSaleActive(o?: Option) {
  if (!o) return false;
  // allow zero as a valid sale price
  if (o.sale?.price == null) return false;
  const now = new Date();
  if (o.sale?.start && new Date(o.sale.start) > now) return false;
  if (o.sale?.end && new Date(o.sale.end) < now) return false;
  return true;
}

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const { language } = useLanguage();
  const nav = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;

    const img = box.querySelector("#product-img") as HTMLImageElement | null;
    const lens = box.querySelector("#magnifier") as HTMLElement | null;
    if (!img || !lens) return;

    // use the real image as the background of the lens
    lens.style.backgroundImage = `url(${img.src})`;

    function move(e: MouseEvent) {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
    }

    box.addEventListener("mousemove", move);
    return () => box.removeEventListener("mousemove", move);
  }, []);

  const isVip =
    !!user &&
    Array.isArray((user as any).roles) &&
    (user as any).roles.includes("vip");

  const [opt, setOpt] = useState<Option | null>(
    product.options?.find((o) => o.isDefault) || product.options?.[0] || null
  );
  const [adding, setAdding] = useState(false);

  const nameStr = tText(product.name as any, language as "en" | "he");
  const descStr = tText((product as any).desc, language as "en" | "he");

  const imageSrc = useMemo(
    () =>
      (opt?.img && opt.img.trim() !== "" ? opt.img : (product as any).img) ||
      "/placeholder.svg",
    [opt?.img, (product as any).img]
  );
  const imageAlt = useMemo(
    () =>
      `${tText(product.name as any, language as "en" | "he")}${
        opt ? " – " + tText(opt.name as any, language as "en" | "he") : ""
      }`.trim(),
    [product.name, opt, language]
  );

  // Build a single cart quantity map to avoid O(n) scans
  const cartQtyByKey = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of cart) {
      const key = `${i.product}|${i.optionId ?? i.optionName ?? ""}`;
      m.set(key, (m.get(key) ?? 0) + (i.quantity ?? 0));
    }
    return m;
  }, [cart]);

  const optKey = useMemo(
    () => `${product._id}|${(opt as any)?._id ?? (opt as any)?.name ?? ""}`,
    [product._id, opt?._id, opt?.name]
  );

  const currentInCart = cartQtyByKey.get(optKey) ?? 0;

  const stockLeft = useMemo(() => opt?.quantity ?? undefined, [opt]);
  const remaining = useMemo(() => {
    if (stockLeft == null) return Infinity;
    return Math.max(0, stockLeft - currentInCart);
  }, [stockLeft, currentInCart]);

  const soldOut = remaining === 0;

  // Pricing
  const saleActiveForCustomer = !isVip && isSaleActive(opt || undefined);
  const base = opt ? Number(opt.price) : 0;
  const vip = opt && opt.vipPrice != null ? Number(opt.vipPrice) : null;
  const sale = opt?.sale?.price != null ? Number(opt.sale!.price) : null;

  const displayPrice = isVip
    ? vip ?? base
    : saleActiveForCustomer && sale != null
    ? sale
    : base;

  const canAdd = !!opt && !soldOut && !adding;

  function handleAdd() {
   
    if (!opt || remaining <= 0) return;

    setAdding(true);
    const p = addToCart(product, opt, 1);
    Promise.resolve(p)
      .catch(() => {
        // optionally show a toast here
      })
      .finally(() => setAdding(false));
  }

  return (
    <Card className="p-4 rounded-2xl border border-border hover:shadow-lg transition-shadow">
      {/* Image with magnifier + badges */}
      <div className="relative">
        <Link to={`/products/${product._id}`}>
          <div
            ref={containerRef}
            className="relative group rounded-xl overflow-hidden"
            style={{ cursor: "none" }}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-64 object-cover"
              id="product-img"
            />

            <div
              id="magnifier"
              className="absolute hidden group-hover:block pointer-events-none"
              style={{
                width: 130, // circle size
                height: 130,
                borderRadius: "50%",
                border: "2px solid white",
                backgroundRepeat: "no-repeat",
                backgroundSize: "650%", // very strong zoom
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </Link>

        {!isVip && saleActiveForCustomer && (
          <span className="absolute left-3 top-3 text-xs font-semibold px-2 py-1 rounded-full bg-accent text-accent-foreground">
            {language === "he" ? "מבצע" : "Sale"}
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 text-xs font-semibold px-2 py-1 rounded-full bg-destructive text-destructive-foreground">
            {language === "he" ? "אזל מהמלאי" : "Sold out"}
          </span>
        )}
      </div>

      {/* Title */}
      <Link
        to={`/products/${product._id}`}
        className="mt-3 block text-xl font-semibold hover:text-accent transition-colors"
      >
        {nameStr}
      </Link>

      {/* Description (optional – currently not rendered) */}

      {/* Option + Stock row */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {product.options?.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[180px] justify-between"
              >
                {opt
                  ? tText(opt.name as any, language as "en" | "he")
                  : language === "he"
                  ? "בחר אפשרות"
                  : "Choose option"}
                <span className="opacity-60">▾</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                {language === "he" ? "בחר אפשרות" : "Select option"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {product.options.map((o: any) => {
                const oKey = `${product._id}|${o._id ?? o.name ?? ""}`;
                const inCart = cartQtyByKey.get(oKey) ?? 0;
                const oStock = o.quantity ?? undefined;
                const oRemaining =
                  oStock == null ? Infinity : Math.max(0, oStock - inCart);
                const oSoldOut = oRemaining === 0;
                const oLabel = tText(o.name as any, language as "en" | "he");

                return (
                  <DropdownMenuItem
                    key={o._id ?? oLabel}
                    className={oSoldOut ? "opacity-50 pointer-events-none" : ""}
                    onClick={() => setOpt(o)}
                  >
                    <div className="flex w-full items-center gap-2">
                      {o.img ? (
                        <img
                          src={o.img}
                          alt={oLabel}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                      )}
                      <span className="truncate">{oLabel}</span>
                      {oRemaining !== Infinity && (
                        <span className="ml-auto text-xs tabular-nums">
                          {oRemaining} {language === "he" ? "נותר" : "left"}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="text-sm text-muted-foreground">
            {language === "he" ? "אפשרות אחת" : "Single option"}
          </div>
        )}

        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            remaining === Infinity
              ? "border-border text-foreground"
              : remaining > 0
              ? "border-green-500 text-green-600"
              : "border-red-500 text-red-600"
          }`}
          aria-label="stock-indicator"
          title={
            language === "he"
              ? "יתרה לאחר פריטים בעגלה"
              : "Remaining after items in your cart"
          }
        >
          {remaining === Infinity
            ? language === "he"
              ? "במלאי"
              : "In stock"
            : remaining > 0
            ? `${remaining} ${language === "he" ? "נותר" : "left"}`
            : language === "he"
            ? "אזל מהמלאי"
            : "Sold out"}
        </span>
      </div>

      {/* Price + Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          {isVip ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                ₪{(vip ?? base).toLocaleString()}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-accent text-accent">
                VIP
              </span>
            </div>
          ) : saleActiveForCustomer && sale != null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-muted-foreground line-through">
                  ₪{base.toLocaleString()}
                </span>
                <span className="text-lg font-bold">
                  ₪{sale.toLocaleString()}
                </span>
              </div>
              {opt?.sale?.end && (
                <span className="text-xs text-muted-foreground">
                  {language === "he" ? "מבצע עד" : "Ends"}{" "}
                  {formatSaleEnd(opt.sale.end, language as "en" | "he")}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                ₪{displayPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/products/${product._id}`}>
            <Button
              variant="outline"
              className="border-accent hover:bg-accent hover:text-accent-foreground"
            >
              {language === "he" ? "פרטים" : "View"}
            </Button>
          </Link>
          <Button
            onClick={handleAdd}
            disabled={!canAdd}
            className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
          >
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

    
    </Card>
  );
}
