// src/contexts/CartContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, Option } from "@/types/product";

export type CartItem = {
  _id: string;        // subdocument id from server
  product: string;    // product ObjectId
  optionId: string;   // option ObjectId
  name: string;       // product name snapshot
  optionName: string; // option name snapshot
  img?: string;
  price: number;      // unit price snapshot
  quantity: number;
};

type Ctx = {
  cart: CartItem[];
  subtotal: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addToCart: (p: Product, opt: Option, qty?: number) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
};

const CartCtx = createContext<Ctx | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Always fetch the source of truth
  const refresh = async () => {
    if (!user) {
      setCart([]);
      setSubtotal(0);
      return;
    }
    setLoading(true);
    try {
      const r = await api.get("/cart", { params: { _ts: Date.now() } }); // cache-bust
      setCart(Array.isArray(r.data?.cart?.items) ? r.data.cart.items : []);
      setSubtotal(typeof r.data?.subtotal === "number" ? r.data.subtotal : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Mutations: do the call, then force refresh
  async function addToCart(p: Product, opt: Option, qty: number = 1) {
    if (!user) throw new Error("LOGIN_REQUIRED");
    if (!opt?._id) throw new Error("OPTION_ID_REQUIRED");
    await api.post("/cart/items", {
      productId: p._id,
      optionId: opt._id,
      quantity: qty,
    });
    await refresh();
  }

  async function updateQty(itemId: string, qty: number) {
    await api.patch(`/cart/items/${itemId}`, { quantity: qty });
    await refresh();
  }

  async function removeItem(itemId: string) {
    await api.delete(`/cart/items/${itemId}`);
    await refresh();
  }

  async function clearCart() {
    await api.delete("/cart");
    await refresh();
  }

  const totalItems = useMemo(
    () => cart.reduce((sum, it) => sum + it.quantity, 0),
    [cart]
  );
  const totalPrice = subtotal;

  return (
    <CartCtx.Provider
      value={{
        cart,
        subtotal,
        loading,
        refresh,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const v = useContext(CartCtx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
