import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { GiftBusinessStore } from "../../../../services/gift-service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const tasks = store.getAllTasks();
  return res.json({ tasks });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const store = GiftBusinessStore.getInstance();
  const { taskId, notes } = req.body as { taskId: string; notes?: string };

  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }

  const completedTask = store.completeTask(taskId, notes);
  if (!completedTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json({
    success: true,
    message: "Task completed and next stage triggered automatically",
    task: completedTask,
  });
}
