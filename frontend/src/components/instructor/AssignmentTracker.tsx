import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock, AlertTriangle, Plus, type LucideIcon } from "lucide-react";
import { useApp } from "@/store";
import { activityLibrary } from "@/data";
import { formatDate, getAssignmentStatus, todayISO, type AssignmentStatus } from "@/utils/assignments";
import AssignActivityDialog from "./AssignActivityDialog";

interface Props {
  studentId: string;
  studentName: string;
}

const statusMeta: Record<AssignmentStatus, { label: string; className: string; Icon: LucideIcon }> = {
  completed: { label: "Completada", className: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  pending: { label: "Pendiente", className: "bg-sky-100 text-sky-700", Icon: Clock },
  overdue: { label: "Vencida", className: "bg-red-100 text-red-700", Icon: AlertTriangle },
};

export default function AssignmentTracker({ studentId, studentName }: Props) {
  const { assignments, assignActivity } = useApp();
  const [showAssign, setShowAssign] = useState(false);
  const today = todayISO();

  const mine = assignments
    .filter((a) => a.studentId === studentId)
    .sort((x, y) => y.assignedAt.localeCompare(x.assignedAt));

  const counts: Record<AssignmentStatus, number> = { completed: 0, pending: 0, overdue: 0 };
  mine.forEach((a) => {
    counts[getAssignmentStatus(a, today)] += 1;
  });

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-extrabold text-slate-700">Actividades asignadas</h3>
        <button
          onClick={() => setShowAssign(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 text-white text-sm font-bold shadow-md hover:bg-amber-600 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          Asignar actividad
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {(Object.keys(statusMeta) as AssignmentStatus[]).map((status) => {
          const meta = statusMeta[status];
          return (
            <div key={status} className={`rounded-2xl p-3 ${meta.className}`}>
              <p className="text-xl font-extrabold">{counts[status]}</p>
              <p className="text-xs font-bold">{meta.label}s</p>
            </div>
          );
        })}
      </div>

      {mine.length === 0 ? (
        <p className="text-center text-slate-400 py-6">Aún no hay actividades asignadas a este estudiante.</p>
      ) : (
        <ul className="space-y-2">
          {mine.map((a) => {
            const activity = activityLibrary.find((act) => act.id === a.activityId);
            if (!activity) return null;
            const status = getAssignmentStatus(a, today);
            const meta = statusMeta[status];
            const Icon = meta.Icon;
            return (
              <li key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                <span className="text-2xl" aria-hidden="true">{activity.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-700 truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                    {a.dueDate ? `Fecha límite: ${formatDate(a.dueDate)}` : "Sin fecha límite"}
                  </p>
                </div>
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${meta.className}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {showAssign && (
        <AssignActivityDialog
          studentName={studentName}
          onAssign={(activityId, dueDate) => {
            assignActivity(studentId, activityId, dueDate);
            setShowAssign(false);
          }}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}
