import { CalendarDays, CheckCircle2, Clock, AlertTriangle, ClipboardList, ChevronRight, type LucideIcon } from "lucide-react";
import { useApp } from "@/store";
import { activityLibrary } from "@/data";
import { formatDate, getAssignmentStatus, todayISO, type AssignmentStatus } from "@/utils/assignments";
import type { AreaKey } from "@/types";

interface Props {
  studentId: string;
  onSelectArea: (area: AreaKey) => void;
}

const statusMeta: Record<AssignmentStatus, { label: string; className: string; Icon: LucideIcon }> = {
  completed: { label: "Completada", className: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  pending: { label: "Por hacer", className: "bg-sky-100 text-sky-700", Icon: Clock },
  overdue: { label: "Vencida", className: "bg-red-100 text-red-700", Icon: AlertTriangle },
};

export default function AssignedActivities({ studentId, onSelectArea }: Props) {
  const { assignments } = useApp();
  const today = todayISO();

  const mine = assignments
    .filter((a) => a.studentId === studentId)
    .map((a) => ({ assignment: a, status: getAssignmentStatus(a, today) }))
    .sort((x, y) => {
      if (x.status === "completed" && y.status !== "completed") return 1;
      if (y.status === "completed" && x.status !== "completed") return -1;
      return (x.assignment.dueDate ?? "9999").localeCompare(y.assignment.dueDate ?? "9999");
    });

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-5 h-5 text-sky-700" />
        <h2 className="text-lg font-extrabold text-slate-700">Mis actividades asignadas</h2>
      </div>

      {mine.length === 0 ? (
        <p className="text-center text-slate-500 py-6">Por ahora no tienes actividades asignadas.</p>
      ) : (
        <ul className="space-y-2">
          {mine.map(({ assignment, status }) => {
            const activity = activityLibrary.find((act) => act.id === assignment.activityId);
            if (!activity) return null;
            const meta = statusMeta[status];
            const Icon = meta.Icon;
            const done = status === "completed";
            return (
              <li key={assignment.id}>
                <button
                  onClick={() => onSelectArea(activity.area)}
                  disabled={done}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 text-left hover:bg-sky-50 disabled:hover:bg-slate-50 disabled:cursor-default transition"
                >
                  <span className="text-2xl" aria-hidden="true">{activity.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 truncate">{activity.title}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                      {assignment.dueDate ? `Hasta el ${formatDate(assignment.dueDate)}` : "Sin fecha límite"}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${meta.className}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </span>
                  {!done && <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
