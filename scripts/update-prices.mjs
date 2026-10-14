import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const prices = {
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

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
  prefer: "return=representation"
};

for (const [slug, price_crc] of Object.entries(prices)) {
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ price_crc })
  });

  if (!response.ok) {
    throw new Error(`${slug}: ${response.status} ${await response.text()}`);
  }
}

const productsResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=slug,price_crc&order=slug`, { headers });
const products = await productsResponse.json();
const missing = products.filter((product) => !product.price_crc);

console.log(JSON.stringify({
  updated: Object.keys(prices).length,
  products: products.length,
  missingPrices: missing.length,
  min: Math.min(...products.map((product) => product.price_crc)),
  max: Math.max(...products.map((product) => product.price_crc))
}, null, 2));
