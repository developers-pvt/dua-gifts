import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GiftBusinessStore } from "../../../services/gift-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const { query } = req.query as { query?: string };

  if (query) {
    const order = store.getOrder(query);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json({ order });
  }

  const orders = store.getAllOrders();
  return res.json({ orders, count: orders.length });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const body = req.body as any;

  try {
    const order = store.createOrder(body);
    return res.status(201).json({
      success: true,
      message: "Gift order created successfully with unified checkout",
      order,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Failed to create gift order" });
  }
}
