import { crc } from "@/lib/currency";

type OrderRecord = {
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  province: string;
  canton: string;
  district: string;
  address: string;
  total_crc: number;
  payment_method: string;
};

type OrderItemRecord = {
  product_name: string;
  brand_name: string;
  size: string;
  quantity: number;
  line_total_crc: number;
};

type NotificationResult = {
  email: "sent" | "skipped" | "failed";
  whatsapp: "sent" | "skipped" | "failed";
};

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Origin Studios";
const ownerWhatsapp = process.env.ORDER_WHATSAPP_TO || "50686037873";

export async function sendOrderNotifications(order: OrderRecord, items: OrderItemRecord[]): Promise<NotificationResult> {
  const [email, whatsapp] = await Promise.allSettled([
    sendCustomerEmail(order, items),
    sendOwnerWhatsapp(order, items)
  ]);

  return {
    email: email.status === "fulfilled" ? email.value : "failed",
    whatsapp: whatsapp.status === "fulfilled" ? whatsapp.value : "failed"
  };
}

function itemSummary(items: OrderItemRecord[]) {
  return items.map((item) => `${item.quantity}x ${item.brand_name} ${item.product_name} - talla ${item.size}`).join("\n");
}

function emailHtml(order: OrderRecord, items: OrderItemRecord[]) {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eadfd3;">${item.quantity}x ${item.brand_name} ${item.product_name}</td>
      <td style="padding:12px;border-bottom:1px solid #eadfd3;text-align:center;">${item.size}</td>
      <td style="padding:12px;border-bottom:1px solid #eadfd3;text-align:right;">${crc(item.line_total_crc)}</td>
    </tr>
  `).join("");

  return `
    <div style="margin:0;background:#fff8ef;padding:28px;font-family:Arial,sans-serif;color:#2b201c;">
      <div style="max-width:620px;margin:auto;background:#fffcf7;border:1px solid #eadfd3;padding:28px;">
        <p style="margin:0 0 10px;color:#790e19;font-size:12px;letter-spacing:2px;text-transform:uppercase;">${storeName}</p>
        <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:34px;color:#3a070c;">Orden confirmada</h1>
        <p>Hola ${order.customer_name}, recibimos tu pedido correctamente.</p>
        <p style="font-size:18px;">Número de orden: <strong>${order.order_number}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-top:18px;background:#fff8ef;">
          <thead>
            <tr>
              <th style="padding:12px;text-align:left;color:#790e19;">Prenda</th>
              <th style="padding:12px;text-align:center;color:#790e19;">Talla</th>
              <th style="padding:12px;text-align:right;color:#790e19;">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:18px;margin-top:20px;">Total: <strong>${crc(order.total_crc)}</strong></p>
        <p>Para finalizar, realiza el pago por SINPE Móvil al <strong>8603-7873</strong> e incluye tu número de orden en el detalle.</p>
        <p style="color:#6b625c;">Entrega: ${order.province}, ${order.canton}, ${order.district}. ${order.address}</p>
      </div>
    </div>
  `;
}

async function sendCustomerEmail(order: OrderRecord, items: OrderItemRecord[]): Promise<NotificationResult["email"]> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;

  if (!apiKey || !from || !order.email) return "skipped";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: order.email,
      subject: `${storeName} - Confirmación ${order.order_number}`,
      html: emailHtml(order, items)
    })
  });

  return response.ok ? "sent" : "failed";
}

async function sendOwnerWhatsapp(order: OrderRecord, items: OrderItemRecord[]): Promise<NotificationResult["whatsapp"]> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!accessToken || !phoneNumberId) return "skipped";

  const message = [
    `Nueva orden ${storeName}`,
    `Orden: ${order.order_number}`,
    `Cliente: ${order.customer_name}`,
    `Tel: ${order.phone}`,
    `Total: ${crc(order.total_crc)}`,
    "Prendas:",
    itemSummary(items)
  ].join("\n");

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: ownerWhatsapp,
      type: "text",
      text: { preview_url: false, body: message }
    })
  });

  return response.ok ? "sent" : "failed";
}
