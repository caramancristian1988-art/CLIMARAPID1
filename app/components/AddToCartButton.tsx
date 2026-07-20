"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

interface Props {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string | null;
  inStock?: boolean;
  variantLabel?: string;
  className: string;
  children: React.ReactNode;
}

export default function AddToCartButton({ slug, name, price, oldPrice = null, image, inStock = true, variantLabel, className, children }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [bump, setBump] = useState(0);

  function handleClick() {
    addToCart({ slug, name, price, oldPrice, image, variantLabel });
    setAdded(true);
    setBump((b) => b + 1);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={!inStock}
      key={bump}
      className={`${className} active:scale-90 transition-transform duration-150 ${bump ? "animate-bump" : ""}`}
    >
      {added ? (
        <span key="added" className="contents animate-pop">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Adăugat!</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
