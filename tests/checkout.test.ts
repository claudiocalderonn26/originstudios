import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { normalizePhone, orderSchema, paymentInstructions, resolveOrderItems } from "../lib/checkout";

const customer = { full_name: "Cliente de prueba", id_number: "123456789", phone: "+506 8888-8888", email: " test@example.com ", province: "San José", canton: "Central", district: "Carmen", address: "Dirección de prueba, local aislado" };
const db = new PGlite();
let variantId: string;
let productId: string;
const create = (overrides: Record<string, unknown> = {}) => ({ requestId: randomUUID(), customer, paymentMethod: "sinpe", items: [{ variantId, quantity: 1 }], ...overrides });
const order = async (payload: unknown) => (await db.query<{ result: any }>("select public.create_store_order($1::jsonb) as result", [JSON.stringify(payload)])).rows[0].result;
const stock = async () => (await db.query<{ stock: number }>("select stock from product_variants where id = $1", [variantId])).rows[0].stock;
before(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role;");
  await db.exec(readFileSync("supabase/migrations/001_initial_schema.sql", "utf8").replace('create extension if not exists "pgcrypto";', ""));
  await db.exec(readFileSync("supabase/migrations/003_initial_inventory.sql", "utf8"));
  await db.exec(readFileSync("supabase/migrations/004_checkout_reliability.sql", "utf8"));
  const row = (await db.query<{ id: string; product_id: string }>("select id,product_id from product_variants limit 1")).rows[0];
  variantId = row.id; productId = row.product_id;
  await db.query("update product_variants set stock = 20 where id = $1", [variantId]);
  await db.query("update products set price_crc = 32900 where id = $1", [productId]);
});
after(() => db.close());

test("normalizes CR phones, email and explains invalid fields", () => {
  assert.equal(normalizePhone("+506 8888-8888"), "88888888");
  const parsed = orderSchema.parse(create());
  assert.equal(parsed.customer.email, "test@example.com");
  const invalid = orderSchema.safeParse(create({ customer: { ...customer, address: "abc" } }));
  assert.equal(invalid.success, false);
  if (!invalid.success) assert.match(invalid.error.issues[0].message, /Dirección/);
});

test("legacy carts resolve to real variants and duplicate lines cannot exceed stock", () => {
  const products = [{ slug: "camiseta", is_active: true, price_crc: 32900, variants: [{ id: variantId, size: "M", stock: 2 }] }];
  const item = { variantId: "old-demo-id", slug: "camiseta", size: "M", quantity: 1 };
  assert.deepEqual(resolveOrderItems([item, item], products), [{ variantId, quantity: 2 }]);
  assert.throws(() => resolveOrderItems([item, item, item], products), /suficientes/);
  assert.throws(() => resolveOrderItems([item], [{ ...products[0], is_active: false }]), /disponible/);
});

for (const paymentMethod of ["sinpe", "bac", "efectivo", "contra_entrega"]) {
  test(`creates ${paymentMethod} order and reserves stock once across retries`, async () => {
    const payload = create({ paymentMethod });
    const initial = await stock();
    const result = await order(payload);
    assert.match(result.orderNumber, /^OS-\d{4}-\d{6}$/);
    assert.equal(result.total, 32900);
    assert.equal(result.paymentMethod, paymentMethod);
    assert.equal(await stock(), initial - 1);
    const retry = await order(payload);
    assert.equal(retry.orderNumber, result.orderNumber);
    assert.equal(retry.replayed, true);
    assert.equal(await stock(), initial - 1);
    if (["efectivo", "contra_entrega"].includes(paymentMethod)) assert.doesNotMatch(paymentInstructions(paymentMethod), /Realiza el SINPE/);
  });
}

test("overselling and invalid quantities roll back without orders or stock changes", async () => {
  const initial = await stock();
  const count = (await db.query<{ n: number }>("select count(*)::int as n from orders")).rows[0].n;
  for (const quantity of [0, -1, 1.5, 99]) {
    await assert.rejects(() => order(create({ items: [{ variantId, quantity }] })));
  }
  assert.equal(await stock(), initial);
  assert.equal((await db.query<{ n: number }>("select count(*)::int as n from orders")).rows[0].n, count);
});

test("duplicate SQL lines aggregate before stock checks", async () => {
  const initial = await stock();
  await assert.rejects(() => order(create({ items: [{ variantId, quantity: initial }, { variantId, quantity: 1 }] })), /suficientes/);
  assert.equal(await stock(), initial);
});

test("inactive or unpriced products cannot be purchased", async () => {
  await db.query("update products set is_active = false where id = $1", [productId]);
  await assert.rejects(() => order(create()), /disponible/);
  await db.query("update products set is_active = true, price_crc = 0 where id = $1", [productId]);
  await assert.rejects(() => order(create()), /precio/);
  await db.query("update products set price_crc = 32900 where id = $1", [productId]);
});

test("migration is rerunnable and anonymous roles cannot bypass checkout validation", async () => {
  await db.exec(readFileSync("supabase/migrations/004_checkout_reliability.sql", "utf8"));
  const permissions = await db.query<{ allowed: boolean }>("select has_function_privilege('anon', 'public.create_store_order(jsonb)', 'execute') as allowed");
  assert.equal(permissions.rows[0].allowed, false);
  const result = await order(create());
  assert.match(result.orderNumber, /^OS-\d{4}-\d{6}$/);
});
