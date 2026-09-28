import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GiftBusinessStore } from "../../../../services/gift-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const { id } = req.params;

  const order = store.getOrder(id);
  if (!order) {
    return res.status(404).json({ error: "Gift order not found" });
  }

  return res.json({ order });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const { id } = req.params;
  const body = req.body as any;

  if (body?.action === "stage" && body?.stage) {
    const updated = store.updateOrderStage(id, body.stage, body.notes, body.actor);
    if (!updated) return res.status(404).json({ error: "Gift order not found" });
    return res.json({ success: true, order: updated });
  }

  const updated = store.updatePayment(id, body);
  if (!updated) {
    return res.status(404).json({ error: "Gift order not found" });
  }

  return res.json({ success: true, order: updated });
}
