"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  cartKey: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  quantity: number;
  variantLabel?: string;
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "quantity" | "cartKey">) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "climatrapid-cart";

function makeCartKey(slug: string, variantLabel?: string) {
  return variantLabel ? `${slug}|${variantLabel}` : slug;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: CartItem[] = JSON.parse(stored);
        // backfill cartKey for items saved before this field existed
        setItems(parsed.map((i) => ({ ...i, cartKey: i.cartKey ?? makeCartKey(i.slug, i.variantLabel) })));
      } catch {
        setItems([]);
      }
    }
  }, []);

  function persist(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addToCart(item: Omit<CartItem, "quantity" | "cartKey">) {
    const cartKey = makeCartKey(item.slug, item.variantLabel);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      const next = existing
        ? prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...item, cartKey, quantity: 1 }];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removeFromCart(cartKey: string) {
    persist(items.filter((i) => i.cartKey !== cartKey));
  }

  function updateQuantity(cartKey: string, quantity: number) {
    if (quantity < 1) return;
    persist(items.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i)));
  }

  function clearCart() {
    persist([]);
  }

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
