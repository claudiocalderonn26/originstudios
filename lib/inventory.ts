import type { Product } from "@/lib/types";
import { productImageMap } from "@/lib/product-image-map";

type InventoryItem = {
  brand: string;
  name: string;
  color: string;
  category: string;
  stock: Record<string, number>;
};

const items: InventoryItem[] = [
  { brand: "Nude Project", name: "Hoodie Turquoise Graphic", color: "Negro", category: "Hoodies", stock: { M: 1, L: 1 } },
  { brand: "Nude Project", name: "Hoodie Cherries", color: "Crema", category: "Hoodies", stock: { M: 1, L: 1 } },
  { brand: "Nude Project", name: "Hoodie Cherries", color: "Negro", category: "Hoodies", stock: { M: 1, L: 1 } },
  { brand: "Scuffers", name: "Hoodie With Love", color: "Negro", category: "Hoodies", stock: { S: 1, M: 1 } },
  { brand: "Nude Project", name: "Camiseta Apple Graphic", color: "Negro", category: "Camisetas", stock: { S: 1, M: 1, L: 1 } },
  { brand: "Nude Project", name: "Camiseta Amor de Verano", color: "Blanco", category: "Camisetas", stock: { L: 1 } },
  { brand: "Scuffers", name: "Camiseta Oranges", color: "Azul marino", category: "Camisetas", stock: { L: 1 } },
  { brand: "Nude Project", name: "Camiseta Sophisticated Pleasure", color: "Negro", category: "Camisetas", stock: { M: 1, L: 2 } },
  { brand: "Nude Project", name: "Camiseta By Artists for Artists", color: "Rosado", category: "Camisetas", stock: { S: 1 } },
  { brand: "Scuffers", name: "Camiseta Not Ibiza Yet", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Scuffers", name: "Camiseta Purple Sun", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 2 } },
  { brand: "Scuffers", name: "Camiseta Gradient Logo", color: "Blanco", category: "Camisetas", stock: { S: 1, M: 1, L: 2 } },
  { brand: "EME Studios", name: "Camiseta Collage", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 2 } },
  { brand: "Scuffers", name: "Camiseta Cherries", color: "Crema", category: "Camisetas", stock: { S: 1, M: 1, L: 2 } },
  { brand: "Nude Project", name: "Camiseta Ibiza Cocktail", color: "Blanco", category: "Camisetas", stock: { S: 1, M: 1, L: 1 } },
  { brand: "Nude Project", name: "Camiseta Winners Club", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Nude Project", name: "Camiseta Winners Club", color: "Gris", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Nude Project", name: "Camiseta Community Over Ego", color: "Azul marino", category: "Camisetas", stock: { S: 1, L: 1 } },
  { brand: "EME Studios", name: "Camiseta Collage", color: "Negro", category: "Camisetas", stock: { M: 2, L: 2 } },
  { brand: "Nude Project", name: "Camiseta Airplane Mode Faces", color: "Negro", category: "Camisetas", stock: { S: 1, M: 1, L: 2 } },
  { brand: "Scuffers", name: "Camiseta Studios Turquoise", color: "Azul marino", category: "Camisetas", stock: { L: 1 } },
  { brand: "Scuffers", name: "Camiseta With Love", color: "Azul marino", category: "Camisetas", stock: { M: 1, L: 2, XL: 1 } },
  { brand: "Scuffers", name: "Camiseta Gradient Logo", color: "Cafe oscuro", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Broken Planet", name: "Camiseta Rolling Loud", color: "Negro", category: "Camisetas", stock: { L: 1 } },
  { brand: "Broken Planet", name: "Hoodie Hearts Are Made to Be Broken", color: "Negro", category: "Hoodies", stock: { L: 1 } },
  { brand: "Stussy", name: "Camiseta Flower", color: "Negro", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Stussy", name: "Camiseta Flower", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Broken Planet", name: "Hoodie Planet Graphic", color: "Negro", category: "Hoodies", stock: { M: 1 } },
  { brand: "Broken Planet", name: "Camiseta Butterfly Graphic", color: "Negro", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Broken Planet", name: "Camiseta Butterfly Graphic", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Broken Planet", name: "Hoodie Into the Abyss", color: "Azul oscuro", category: "Hoodies", stock: { M: 1, L: 2 } },
  { brand: "Casablanca", name: "Camiseta Graphic", color: "Blanco", category: "Camisetas", stock: { M: 1, L: 1 } },
  { brand: "Broken Planet", name: "Camiseta Speed of Light", color: "Negro", category: "Camisetas", stock: { M: 1, L: 1 } }
];

export const inventoryPrices: Record<string, number> = {
  "nude-project-hoodie-turquoise-graphic-negro": 49900,
  "nude-project-hoodie-cherries-crema": 48900,
  "nude-project-hoodie-cherries-negro": 48900,
  "scuffers-hoodie-with-love-negro": 46900,
  "nude-project-camiseta-apple-graphic-negro": 32900,
  "nude-project-camiseta-amor-de-verano-blanco": 31900,
  "scuffers-camiseta-oranges-azul-marino": 31900,
  "nude-project-camiseta-sophisticated-pleasure-negro": 34900,
  "nude-project-camiseta-by-artists-for-artists-rosado": 32900,
  "scuffers-camiseta-not-ibiza-yet-blanco": 31900,
  "scuffers-camiseta-purple-sun-blanco": 32900,
  "scuffers-camiseta-gradient-logo-blanco": 31900,
  "eme-studios-camiseta-collage-blanco": 33900,
  "scuffers-camiseta-cherries-crema": 32900,
  "nude-project-camiseta-ibiza-cocktail-blanco": 33900,
  "nude-project-camiseta-winners-club-blanco": 32900,
  "nude-project-camiseta-winners-club-gris": 32900,
  "nude-project-camiseta-community-over-ego-azul-marino": 31900,
  "eme-studios-camiseta-collage-negro": 33900,
  "nude-project-camiseta-airplane-mode-faces-negro": 34900,
  "scuffers-camiseta-studios-turquoise-azul-marino": 31900,
  "scuffers-camiseta-with-love-azul-marino": 32900,
  "scuffers-camiseta-gradient-logo-cafe-oscuro": 31900,
  "broken-planet-camiseta-rolling-loud-negro": 35900,
  "broken-planet-hoodie-hearts-are-made-to-be-broken-negro": 51900,
  "stussy-camiseta-flower-negro": 35900,
  "stussy-camiseta-flower-blanco": 35900,
  "broken-planet-hoodie-planet-graphic-negro": 44900,
  "broken-planet-camiseta-butterfly-graphic-negro": 34900,
  "broken-planet-camiseta-butterfly-graphic-blanco": 34900,
  "broken-planet-hoodie-into-the-abyss-azul-oscuro": 51900,
  "casablanca-camiseta-graphic-blanco": 35900,
  "broken-planet-camiseta-speed-of-light-negro": 34900
};

export const fallbackProducts: Product[] = items.map((item, index) => {
  const slug = slugify(`${item.brand}-${item.name}-${item.color}`);
  return {
    id: makeId(index + 1, 0),
    slug,
    name: `${item.name} - ${item.color}`,
    description: `Inventario inicial Origin Studios. Marca: ${item.brand}. Color: ${item.color}.`,
    price_crc: inventoryPrices[slug] || 0,
    is_active: true,
    is_featured: index < 8,
    brand: { name: item.brand },
    category: { name: item.category },
    images: (productImageMap[slug] || []).map((image, imageIndex) => ({
      id: makeId(index + 1, imageIndex + 100),
      url: image.url,
      alt: `${item.name} - ${item.color} foto ${imageIndex + 1}`,
      position: image.position
    })),
    variants: Object.entries(item.stock).map(([size, stock], variantIndex) => ({
      id: makeId(index + 1, variantIndex + 1),
      size,
      stock
    }))
  };
});

export const inventorySummary = {
  models: fallbackProducts.length,
  units: fallbackProducts.reduce((sum, product) => sum + product.variants.reduce((variantSum, variant) => variantSum + variant.stock, 0), 0)
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeId(model: number, variant: number) {
  return `00000000-0000-4000-8000-${model.toString(16).padStart(8, "0")}${variant.toString(16).padStart(4, "0")}`;
}
