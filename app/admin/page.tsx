import { adminSupabase } from "@/lib/supabase";
import { crc } from "@/lib/currency";
import { ProductCreator } from "@/components/ProductCreator";
import { AdminInventoryManager } from "@/components/AdminInventoryManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminEmail = process.env.ADMIN_EMAIL || "claudiocalderonn26@gmail.com";
  let stats = { products: 0, soldOut: 0, pending: 0, monthSales: 0 };
  let orders: any[] = [];
  let products: any[] = [];

  try {
    const supabase = adminSupabase();
    const [{ count: productCount }, { data: variants }, { data: orderRows }, { data: productRows }] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("product_variants").select("product_id, stock"),
      supabase.from("orders").select("order_number, created_at, customer_name, total_crc, payment_method, payment_status, fulfillment_status").order("created_at", { ascending: false }).limit(20),
      supabase
        .from("products")
        .select(`
          id, slug, name, description, price_crc, is_active, is_featured,
          brand:brands(name),
          category:categories(name),
          images:product_images(id, url, alt, position),
          variants:product_variants(id, size, stock)
        `)
        .order("created_at", { ascending: false })
    ]);
    const byProduct = new Map<string, number>();
    variants?.forEach((variant) => byProduct.set(variant.product_id, (byProduct.get(variant.product_id) || 0) + variant.stock));
    orders = orderRows || [];
    products = productRows || [];
    stats = {
      products: productCount || 0,
      soldOut: [...byProduct.values()].filter((stock) => stock <= 0).length,
      pending: orders.filter((order) => order.payment_status === "pendiente").length,
      monthSales: orders.filter((order) => order.payment_status === "pagado").reduce((sum, order) => sum + order.total_crc, 0)
    };
  } catch {
    orders = [];
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-warmgray">Panel privado</p>
          <h1 className="mt-3 font-editorial text-5xl">Admin Origin Studios</h1>
          <p className="mt-3 text-sm text-warmgray">Acceso inicial autorizado: {adminEmail}. Conecta Supabase Auth para bloquear esta ruta en producción.</p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Pedidos pendientes" value={stats.pending.toString()} />
        <Stat label="Ventas verificadas" value={crc(stats.monthSales)} />
        <Stat label="Productos activos" value={stats.products.toString()} />
        <Stat label="Productos agotados" value={stats.soldOut.toString()} />
      </section>

      <section className="mt-8">
        <ProductCreator />
      </section>

      <section className="mt-8">
        <AdminInventoryManager initialProducts={products} />
      </section>

      <section className="mt-8 rounded border border-ink/10 bg-warmwhite p-6">
        <h2 className="font-editorial text-3xl">Pedidos</h2>
        <div className="mt-5 overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-warmgray">
              <tr><th>Orden</th><th>Fecha</th><th>Cliente</th><th>Monto</th><th>Pago</th><th>Estado</th><th>Entrega</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_number} className="border-t border-ink/10">
                  <td className="py-3">{order.order_number}</td>
                  <td>{new Date(order.created_at).toLocaleDateString("es-CR")}</td>
                  <td>{order.customer_name}</td>
                  <td>{crc(order.total_crc)}</td>
                  <td>{order.payment_method}</td>
                  <td>{order.payment_status}</td>
                  <td>{order.fulfillment_status}</td>
                </tr>
              ))}
              {!orders.length ? <tr><td colSpan={7} className="py-8 text-center text-warmgray">Sin pedidos todavía.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-ink/10 bg-warmwhite p-5"><p className="text-xs uppercase tracking-[0.22em] text-warmgray">{label}</p><p className="mt-3 font-editorial text-4xl">{value}</p></div>;
}
