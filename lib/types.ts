export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

export type ProductVariant = {
  id: string;
  size: string;
  stock: number;
};

export type Product = {
  availabilityUnknown?: boolean;
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_crc: number;
  is_active: boolean;
  is_featured: boolean;
  brand: { name: string } | null;
  category: { name: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type CartLine = {
  stock?: number;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  brand: string;
  size: string;
  image: string;
  price: number;
  quantity: number;
};
