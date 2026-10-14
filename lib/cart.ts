import type { CartLine } from "@/lib/types";

export function readCart(): CartLine[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("origin-cart") || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((line): line is CartLine => line && typeof line.variantId === "string" && typeof line.slug === "string" && typeof line.size === "string" && Number.isInteger(line.quantity) && line.quantity > 0 && Number.isFinite(line.price) && line.price >= 0);
  } catch { return []; }
}

export function saveCart(lines: CartLine[]) {
  localStorage.setItem("origin-cart", JSON.stringify(lines));
  window.dispatchEvent(new Event("origin-cart-updated"));
}
