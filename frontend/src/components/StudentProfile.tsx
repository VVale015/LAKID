// StudentProfile.tsx
import { ArrowLeft, Award, LogOut, BookOpen, TrendingUp } from "lucide-react";
import { useApp } from "../store";
import { areaMeta } from "../data";
import ProgressBar from "./ProgressBar";
import type { AreaKey } from "../types";

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export default function StudentProfile({ onBack, onLogout }: Props) {
  const { currentStudent } = useApp();
  if (!currentStudent) return null;

  const areas = Object.entries(areaMeta) as [AreaKey, typeof areaMeta[string]][];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700">Mi Perfil</h1>
        <button
          onClick={onLogout}
          className="ml-auto p-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-5 py-6 space-y-5">
        {/* Avatar card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-6xl mx-auto mb-4">
            {currentStudent.avatar}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-700">{currentStudent.name}</h2>
          <p className="text-slate-400">{currentStudent.age} años</p>

          <div className="mt-5 space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600">Progreso general</span>
              <span className="text-sm font-extrabold text-sky-500">{currentStudent.progress}%</span>
            </div>
            <ProgressBar value={currentStudent.progress} size="lg" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-sky-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{currentStudent.progress}%</p>
            <p className="text-xs text-slate-400">Avance</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{currentStudent.activitiesCompleted}</p>
            <p className="text-xs text-slate-400">Actividades</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{currentStudent.achievements.length}</p>
            <p className="text-xs text-slate-400">Logros</p>
          </div>
        </div>

        {/* Area breakdown */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-700 mb-4">Progreso por área</h3>
          <div className="space-y-4">
            {areas.map(([key, meta]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <span className="text-lg">{meta.emoji}</span>
                    {meta.label}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    {currentStudent.areaProgress[key]}%
                  </span>
                </div>
                <ProgressBar
                  value={currentStudent.areaProgress[key]}
                  color={meta.bg.replace("from-", "from-").replace("to-", "to-")}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {currentStudent.areaActivities[key]} actividades completadas
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-slate-700">Mis logros</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {currentStudent.achievements.map((a) => (
              <div
                key={a}
                className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <span className="font-bold text-amber-700">{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
