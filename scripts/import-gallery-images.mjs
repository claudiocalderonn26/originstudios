import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const galleryPath = "C:\\Users\\claud\\Downloads\\Origin_Fotos_Oficiales_Galeria.html";
const outputDir = path.join(projectRoot, "public", "product-images");

const env = Object.fromEntries(
  fs.readFileSync(path.join(projectRoot, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
  prefer: "return=representation"
};

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/Ã¼/g, "ü")
    .replace(/Â·/g, "·")
    .replace(/â€”/g, "—")
    .replace(/â†—/g, "↗")
    .trim();
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function productSlugFromTitle(title) {
  const parts = title.split(" - ").map((part) => part.trim()).filter(Boolean);
  return slugify(parts.join("-"));
}

function extensionFromMime(mime) {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

async function supabase(pathname, options = {}) {
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${pathname}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    throw new Error(`${pathname}: ${response.status} ${text}`);
  }
  return data;
}

fs.mkdirSync(outputDir, { recursive: true });

const html = fs.readFileSync(galleryPath, "utf8");
const sections = [...html.matchAll(/<section class="product[^"]*"[\s\S]*?<\/section>/g)].map((match) => match[0]);

const results = [];
const skipped = [];

for (const section of sections) {
  const titleMatch = section.match(/<h2>([\s\S]*?)<\/h2>/);
  if (!titleMatch) continue;

  const title = stripTags(titleMatch[1]);
  const slug = productSlugFromTitle(title);
  const images = [...section.matchAll(/<img\s+[^>]*src="data:image\/([^;]+);base64,([^"]+)"[^>]*alt="([^"]*)"/g)];

  if (!images.length) {
    skipped.push({ title, slug, reason: "sin imagenes" });
    continue;
  }

  const products = await supabase(`products?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name`);
  if (!products.length) {
    skipped.push({ title, slug, reason: "producto no encontrado" });
    continue;
  }

  const product = products[0];
  await supabase(`product_images?product_id=eq.${product.id}`, { method: "DELETE" });

  const rows = images.slice(0, 3).map((image, index) => {
    const mime = image[1];
    const base64 = image[2];
    const alt = stripTags(image[3] || `${product.name} foto ${index + 1}`);
    const extension = extensionFromMime(mime);
    const fileName = `${slug}-${index + 1}.${extension}`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

    return {
      product_id: product.id,
      url: `/product-images/${fileName}`,
      alt,
      position: index
    };
  });

  await supabase("product_images", {
    method: "POST",
    body: JSON.stringify(rows)
  });

  results.push({ title, slug, count: rows.length });
}

console.log(JSON.stringify({
  importedProducts: results.length,
  importedImages: results.reduce((sum, item) => sum + item.count, 0),
  skippedWithReason: skipped.length,
  results,
  skipped
}, null, 2));
