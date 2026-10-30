// StudentDashboard.tsx
import { LogOut, Award, TrendingUp, CheckCircle, Bot, ChevronRight } from "lucide-react";
import { useApp } from "../store";
import { areaMeta } from "../data";
import { Logo } from "./Logo";
import ProgressBar from "./ProgressBar";
import AssignedActivities from "./student/AssignedActivities";
import type { AreaKey } from "../types";

interface Props {
  onSelectArea: (area: AreaKey) => void;
  onProfile: () => void;
  onAssistant: () => void;
  onLogout: () => void;
}

export default function StudentDashboard({ onSelectArea, onProfile, onAssistant, onLogout }: Props) {
  const { currentStudent } = useApp();
  if (!currentStudent) return null;

  const areas = Object.entries(areaMeta) as [AreaKey, typeof areaMeta[string]][];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <button
            onClick={onProfile}
            className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-2xl hover:scale-110 transition"
          >
            {currentStudent.avatar}
          </button>
          <button
            onClick={onLogout}
            className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* Welcome card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-4xl">
              {currentStudent.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">¡Hola!</p>
              <h1 className="text-2xl font-extrabold text-slate-700">{currentStudent.name}</h1>
              <p className="text-sm text-slate-400">{currentStudent.age} años</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600">Progreso general</span>
              <span className="text-sm font-extrabold text-sky-500">{currentStudent.progress}%</span>
            </div>
            <ProgressBar value={currentStudent.progress} size="lg" />
            <p className="text-xs text-slate-400">
              {currentStudent.activitiesCompleted} actividades completadas
            </p>
          </div>
        </div>

        {/* Assigned activities */}
        <AssignedActivities studentId={currentStudent.id} onSelectArea={onSelectArea} />

        {/* Areas */}
        <div>
          <h2 className="text-lg font-extrabold text-slate-700 mb-3">¿Qué quieres hacer hoy?</h2>
          <div className="grid grid-cols-2 gap-4">
            {areas.map(([key, meta]) => (
              <button
                key={key}
                onClick={() => onSelectArea(key)}
                className={`bg-gradient-to-br ${meta.bg} rounded-3xl p-5 text-white shadow-lg hover:scale-[1.03] active:scale-95 transition text-left`}
              >
                <div className="text-5xl mb-3">{meta.emoji}</div>
                <h3 className="text-xl font-extrabold">{meta.label}</h3>
                <div className="mt-2 bg-white/25 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${currentStudent.areaProgress[key]}%` }}
                  />
                </div>
                <p className="text-xs text-white/80 mt-1">{currentStudent.areaProgress[key]}% completado</p>
              </button>
            ))}
          </div>
        </div>

        {/* Assistant */}
        <button
          onClick={onAssistant}
          className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] active:scale-95 transition text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-7 h-7 text-sky-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-slate-700">Asistente de aprendizaje</h2>
            <p className="text-sm text-slate-500">Pregunta lo que necesites y te ayudo paso a paso.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </button>

        {/* Achievements preview */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-extrabold text-slate-700">Mis logros</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentStudent.achievements.map((a) => (
              <span
                key={a}
                className="px-3 py-1.5 bg-amber-50 text-amber-600 text-sm font-bold rounded-full flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-700">{currentStudent.activitiesCompleted}</p>
              <p className="text-xs text-slate-400">Actividades</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-700">{currentStudent.progress}%</p>
              <p className="text-xs text-slate-400">Avance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
