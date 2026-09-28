import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AIService } from "../../../services/providers";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { action, recipientName, occasion, relationship, tone, budget, recipientType } = req.body as any;

  if (action === "recommendations") {
    const recommendations = await AIService.getGiftRecommendations({
      occasion: occasion || "Birthday",
      budget: budget || 5000,
      recipientType: recipientType || "Friend",
    });
    return res.json({ recommendations });
  }

  // Default: generate gift card message
  const message = await AIService.generateGiftMessage({
    recipientName: recipientName || "Friend",
    occasion: occasion || "Special Day",
    relationship: relationship || "Loved One",
    tone: tone || "Heartfelt",
  });

  return res.json({ message });
}
