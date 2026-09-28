import { useState, useEffect } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ListCheckbox, CheckCircle, Clock } from "@medusajs/icons";
import { Container, Heading, Badge, Button, Input } from "@medusajs/ui";

interface EmployeeTask {
  id: string;
  orderId: string;
  orderNumber: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  dueAt: string;
}

const EmployeeHubPage = () => {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  const loadTasks = async () => {
    try {
      const res = await fetch("http://localhost:9000/store/gift-operations/tasks", {
        headers: {
          "x-publishable-api-key": "pk_giftstudio_web_99182",
        },
      });
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await fetch("http://localhost:9000/store/gift-operations/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": "pk_giftstudio_web_99182",
        },
        body: JSON.stringify({ taskId, notes: "Task completed via Medusa Admin workstation" }),
      });
      await loadTasks();
    } catch (err) {
      alert("Failed to complete task");
    } finally {
      setCompletingId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterType === "ALL") return true;
    if (filterType === "PENDING") return t.status !== "COMPLETED";
    if (filterType === "COMPLETED") return t.status === "COMPLETED";
    return t.type === filterType;
  });

  return (
    <Container className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color="purple">Workstation: See → Work → Complete</Badge>
          </div>
          <Heading level="h1">Employee Hub</Heading>
          <p className="text-ui-fg-subtle text-sm mt-1">
            Task execution board for Procurement, Quality Inspection, Luxury Hamper Assembly, and Dispatch.
          </p>
        </div>
        <Button variant="secondary" size="small" onClick={loadTasks}>
          ↻ Refresh Tasks
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "ALL", label: "All Tasks" },
          { id: "PENDING", label: "Active" },
          { id: "PROCURE_EXTERNAL", label: "Procurement" },
          { id: "QUALITY_CHECK", label: "Quality Check" },
          { id: "ASSEMBLE_GIFT", label: "Gift Assembly" },
          { id: "PACK_GIFT", label: "Packing" },
          { id: "COMPLETED", label: "Completed" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filterType === tab.id ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilterType(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-ui-fg-muted">Loading employee tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-lg text-ui-fg-muted">
          No tasks found in this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isDone = task.status === "COMPLETED";
            return (
              <div
                key={task.id}
                className="p-5 rounded-xl border border-ui-border-base bg-ui-bg-base flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge color={isDone ? "green" : "orange"}>
                      {task.type.replace("_", " ")}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-ui-fg-subtle">
                      #{task.orderNumber}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-ui-fg-base">{task.title}</h3>
                  <p className="text-xs text-ui-fg-subtle leading-relaxed">{task.description}</p>

                  {task.assignedTo && (
                    <div className="text-xs text-ui-fg-muted">
                      Assigned to: <strong className="text-ui-fg-base">{task.assignedTo}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-ui-border-base flex items-center justify-between">
                  <span className="text-xs text-ui-fg-muted">Priority: {task.priority}</span>
                  {isDone ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle /> Completed
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="small"
                      disabled={completingId === task.id}
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      {completingId === task.id ? "Updating..." : "Mark Complete → Next Stage"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Employee Hub",
  icon: ListCheckbox,
});

export default EmployeeHubPage;
