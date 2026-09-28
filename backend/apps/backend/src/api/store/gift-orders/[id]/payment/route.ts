import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GiftBusinessStore } from "../../../../../services/gift-service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const { id } = req.params;
  const body = req.body as any;

  const updated = store.updatePayment(id, body);
  if (!updated) {
    return res.status(404).json({ error: "Gift order not found" });
  }

  return res.json({ success: true, order: updated });
}
