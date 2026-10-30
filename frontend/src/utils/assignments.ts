import type { Assignment } from "@/types";

export type AssignmentStatus = "completed" | "overdue" | "pending";

export function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function getAssignmentStatus(assignment: Assignment, today: string): AssignmentStatus {
  if (assignment.completedAt) return "completed";
  if (assignment.dueDate && assignment.dueDate < today) return "overdue";
  return "pending";
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}
