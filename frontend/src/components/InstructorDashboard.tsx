// InstructorDashboard.tsx
import { useState } from "react";
import { LogOut, ChevronRight, Search, AlertTriangle } from "lucide-react";
import { useApp } from "@/store";
import { Logo } from "./Logo";
import ProgressBar from "./ProgressBar";
import StudentDetail from "./instructor/StudentDetail";
import { getAssignmentStatus, todayISO } from "@/utils/assignments";

interface Props {
  onLogout: () => void;
}

export default function InstructorDashboard({ onLogout }: Props) {
  const { allStudents, assignments, currentUser } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const today = todayISO();

  const filtered = allStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = allStudents.find((s) => s.id === selectedId);

  if (selected) {
    return <StudentDetail student={selected} onBack={() => setSelectedId(null)} />;
  }

  const openCount = (studentId: string) => {
    const mine = assignments.filter((a) => a.studentId === studentId);
    const overdue = mine.filter((a) => getAssignmentStatus(a, today) === "overdue").length;
    const pending = mine.filter((a) => getAssignmentStatus(a, today) === "pending").length;
    return { pending, overdue };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">{currentUser || "Instructor"}</span>
          <button
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="p-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-700 mb-4">Panel del instructor</h1>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-amber-600">{allStudents.length}</p>
              <p className="text-xs text-slate-500">Estudiantes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-green-600">
                {assignments.filter((a) => getAssignmentStatus(a, today) === "completed").length}
              </p>
              <p className="text-xs text-slate-500">Completadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-sky-600">
                {assignments.filter((a) => getAssignmentStatus(a, today) !== "completed").length}
              </p>
              <p className="text-xs text-slate-500">Por completar</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar estudiante..."
            aria-label="Buscar estudiante"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white focus:border-amber-400 focus:outline-none transition text-slate-700"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((s) => {
            const { pending, overdue } = openCount(s.id);
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] transition text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl flex-shrink-0">
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-700">{s.name}</h3>
                  <p className="text-xs text-slate-500 mb-1.5">
                    {s.age} años · {pending} pendientes
                    {overdue > 0 && (
                      <span className="inline-flex items-center gap-1 ml-2 font-bold text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {overdue} vencidas
                      </span>
                    )}
                  </p>
                  <ProgressBar value={s.progress} color="from-amber-400 to-orange-400" size="sm" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-8">No se encontraron estudiantes</p>
          )}
        </div>
      </div>
    </div>
  );
}
