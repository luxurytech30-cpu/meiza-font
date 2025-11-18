// src/pages/Cart.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Cart() {
  const { t } = useLanguage();
  const { cart, subtotal, updateQty, removeItem } = useCart();
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [qtyEdits, setQtyEdits] = useState<Record<string, string>>({});

  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  if (!cart.length) {
    return (
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">
            {t("cart.empty")}
          </h1>
          <Link to="/products">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {t("cart.continueShopping")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  async function changeQty(itemId: string, next: number) {
    if (next < 1) return;
    if (busy[itemId]) return;
    try {
      setBusy((m) => ({ ...m, [itemId]: true }));
      await updateQty(itemId, next);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Failed to update quantity";
      toast?.error?.(msg);
    } finally {
      setBusy((m) => ({ ...m, [itemId]: false }));
    }
  }

  async function onRemove(itemId: string) {
    if (busy[itemId]) return;
    try {
      setBusy((m) => ({ ...m, [itemId]: true }));
      await removeItem(itemId);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Failed to remove item";
      toast?.error?.(msg);
    } finally {
      setBusy((m) => ({ ...m, [itemId]: false }));
    }
  }

  function commitQtyInput(itemId: string, fallback: number) {
    const raw = qtyEdits[itemId];
    const parsed = Number.parseInt(raw ?? "", 10);
    if (Number.isFinite(parsed) && parsed >= 1) changeQty(itemId, parsed);
    setQtyEdits(({ [itemId]: _omit, ...rest }) => rest);
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-12 text-foreground">
          {t("cart.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const id = item._id; // cart-line id
              const pending = !!busy[id];
              const line = item.price * item.quantity;

              const productId = (item as any).product ?? (item as any).productId;
              const productPath = `/products/${productId}`;

              const qtyValue = qtyEdits[id] ?? String(item.quantity);

              return (
                <Card key={id} className="p-6 border-border">
                  <div className="flex gap-6">
                    <Link to={productPath} className="shrink-0">
                      <img
                        src={item.img || "/placeholder.svg"}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded hover:opacity-90 transition"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link to={productPath} className="hover:underline">
                        <h3 className="text-xl font-semibold mb-1 text-foreground">
                          {item.name}
                        </h3>
                      </Link>

                      {item.optionName && (
                        <div className="text-sm text-muted-foreground mb-3">{item.optionName}</div>
                      )}

                      <p className="text-accent font-semibold mb-4">
                        ₪{item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-4">
                        {/* Qty controls with numeric input */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => changeQty(id, item.quantity - 1)}
                            className="h-8 w-8 border-border"
                            aria-label={t("common.decrease") || "Decrease"}
                            disabled={item.quantity <= 1 || pending}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            className="h-8 w-16 text-center"
                            value={qtyValue}
                            disabled={pending}
                            onChange={(e) => {
                              const v = e.currentTarget.value.replace(/[^\d]/g, "");
                              setQtyEdits((m) => ({ ...m, [id]: v }));
                            }}
                            onBlur={() => commitQtyInput(id, item.quantity)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                            }}
                            aria-label={t("cart.quantity") || "Quantity"}
                          />

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => changeQty(id, item.quantity + 1)}
                            className="h-8 w-8 border-border"
                            aria-label={t("common.increase") || "Increase"}
                            disabled={pending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemove(id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label={t("cart.remove")}
                          disabled={pending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-semibold text-foreground">
                        ₪{line.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-border sticky top-24">
              <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
                {t("cart.title")}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("cart.subtotal")}</span>
                  <span>₪{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>{t("cart.shipping")}</span>
                  <span>₪{shipping.toLocaleString()}</span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-foreground">{t("cart.total")}</span>
                    <span className="text-accent">₪{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold mb-4"
                onClick={() => alert("Checkout goes here")}
              >
                {t("cart.checkout")}
              </Button>

              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  {t("cart.continueShopping")}
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
