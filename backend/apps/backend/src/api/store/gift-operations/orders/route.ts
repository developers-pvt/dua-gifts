import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GiftBusinessStore, OrderStage } from "../../../../services/gift-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const orders = store.getAllOrders();

  const metrics = {
    totalOrders: orders.length,
    inAssembly: orders.filter((o) => o.currentStage === "GIFT_ASSEMBLY").length,
    inProcurement: orders.filter((o) => o.currentStage === "PROCUREMENT_INVENTORY").length,
    inQC: orders.filter((o) => o.currentStage === "QUALITY_CHECK").length,
    shippedDelivered: orders.filter((o) => o.currentStage === "SHIPPED" || o.currentStage === "DELIVERED").length,
    revenueTotal: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    slaBreachRiskCount: orders.filter((o) => o.slaStatus === "WARNING" || o.slaStatus === "ESCALATED").length,
  };

  return res.json({ orders, metrics });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const { orderId, nextStage, notes, actor } = req.body as {
    orderId: string;
    nextStage: OrderStage;
    notes?: string;
    actor?: string;
  };

  if (!orderId || !nextStage) {
    return res.status(400).json({ error: "orderId and nextStage are required" });
  }

  const updatedOrder = store.updateOrderStage(orderId, nextStage, notes, actor);
  if (!updatedOrder) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json({ success: true, order: updatedOrder });
}
