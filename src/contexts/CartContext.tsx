// src/contexts/CartContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Product, Option } from "@/types/product";

export type CartItem = {
  _id: string;
  product: string;
  optionId: string;
  name: string;
  optionName: string;
  img?: string;
  price: number;
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

  // read server response into state
  function applyServerCart(data: any) {
    const items = Array.isArray(data?.cart?.items) ? data.cart.items : [];
    const sub = typeof data?.subtotal === "number" ? data.subtotal : 0;

    setCart(items);
    setSubtotal(sub);
  }

  // initial load + when user changes (login/logout)
  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api.get("/cart", { params: { _ts: Date.now() } });
      applyServerCart(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // whenever user changes, we re-fetch cart
    // (backend will use user._id if logged-in, or guestId if not)
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // ---- MUTATIONS ----

  async function addToCart(p: Product, opt: Option, qty: number = 1) {
    if (!opt?._id) throw new Error("OPTION_ID_REQUIRED");

    setLoading(true);
    try {
      const r = await api.post("/cart/items", {
        productId: p._id,
        optionId: opt._id,
        quantity: qty,
      });
      applyServerCart(r.data);
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(itemId: string, qty: number) {
    setLoading(true);
    try {
      const r = await api.patch(`/cart/items/${itemId}`, {
        quantity: qty,
      });
      applyServerCart(r.data);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId: string) {
    setLoading(true);
    try {
      const r = await api.delete(`/cart/items/${itemId}`);
      applyServerCart(r.data);
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    setLoading(true);
    try {
      const r = await api.delete("/cart");
      applyServerCart(r.data);
    } finally {
      setLoading(false);
    }
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
