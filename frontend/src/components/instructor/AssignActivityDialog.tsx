import { useEffect, useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { activityLibrary, areaMeta, difficultyMeta } from "@/data";
import type { AreaKey, Difficulty } from "@/types";
import { todayISO } from "@/utils/assignments";

interface Props {
  studentName: string;
  onAssign: (activityId: string, dueDate: string | null) => void;
  onClose: () => void;
}

const areaOptions = Object.entries(areaMeta) as [AreaKey, (typeof areaMeta)[string]][];
const difficultyOptions: Difficulty[] = [1, 2, 3];

const chipClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-sm font-bold border-2 transition ${
    active
      ? "border-amber-500 bg-amber-500 text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
  }`;

export default function AssignActivityDialog({ studentName, onAssign, onClose }: Props) {
  const [area, setArea] = useState<AreaKey | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const today = todayISO();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const visible = activityLibrary.filter(
    (a) => (area === "all" || a.area === area) && (difficulty === "all" || a.difficulty === difficulty),
  );

  const handleAssign = () => {
    if (!selectedId) {
      setError("Selecciona una actividad para continuar.");
      return;
    }
    if (dueDate && dueDate < today) {
      setError("La fecha límite no puede ser anterior a hoy.");
      return;
    }
    onAssign(selectedId, dueDate || null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-title"
        className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div>
            <h2 id="assign-title" className="text-lg font-extrabold text-slate-700">
              Asignar actividad
            </h2>
            <p className="text-sm text-slate-400">Para {studentName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full hover:bg-slate-100 transition text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div role="group" aria-label="Filtrar por módulo" className="flex flex-wrap gap-2">
            <button aria-pressed={area === "all"} onClick={() => setArea("all")} className={chipClass(area === "all")}>
              Todos los módulos
            </button>
            {areaOptions.map(([key, meta]) => (
              <button
                key={key}
                aria-pressed={area === key}
                onClick={() => setArea(key)}
                className={chipClass(area === key)}
              >
                {meta.label}
              </button>
            ))}
          </div>

          <div role="group" aria-label="Filtrar por dificultad" className="flex flex-wrap gap-2">
            <button
              aria-pressed={difficulty === "all"}
              onClick={() => setDifficulty("all")}
              className={chipClass(difficulty === "all")}
            >
              Cualquier dificultad
            </button>
            {difficultyOptions.map((d) => (
              <button
                key={d}
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={chipClass(difficulty === d)}
              >
                {difficultyMeta[d].label}
              </button>
            ))}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visible.map((act) => {
              const selected = selectedId === act.id;
              const meta = areaMeta[act.area];
              return (
                <li key={act.id}>
                  <button
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedId(act.id);
                      setError("");
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                      selected ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl">{act.emoji}</span>
                      {selected && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                          <Check className="w-4 h-4" /> Seleccionada
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-extrabold text-slate-700">{act.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{meta.label}</span>
                      <span className={`px-2 py-1 rounded-full ${difficultyMeta[act.difficulty].className}`}>
                        {difficultyMeta[act.difficulty].label}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && (
            <p className="text-center text-slate-400 py-6">No hay actividades con estos filtros.</p>
          )}

          <div>
            <label htmlFor="due-date" className="block text-sm font-bold text-slate-600 mb-2">
              Fecha límite (opcional)
            </label>
            <input
              id="due-date"
              type="date"
              min={today}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setError("");
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-slate-700"
            />
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm font-bold text-red-700">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            className="px-5 py-3 rounded-2xl font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 transition shadow-md"
          >
            Asignar actividad
          </button>
        </div>
      </div>
    </div>
  );
}
