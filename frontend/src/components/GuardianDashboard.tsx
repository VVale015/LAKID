// GuardianDashboard.tsx

import { LogOut, TrendingUp, BookOpen, Award, Bot, ChevronRight } from "lucide-react";
import { useApp } from "../store";
import { areaMeta } from "../data";
import { Logo } from "./Logo";
import ProgressBar from "./ProgressBar";
import type { AreaKey } from "../types";

interface Props {
  onAssistant: () => void;
  onLogout: () => void;
}

export default function GuardianDashboard({ onAssistant, onLogout }: Props) {
  const { currentStudent, allStudents, setCurrentStudentId } = useApp();
  const student = currentStudent ?? allStudents[0];
  const areas = Object.entries(areaMeta) as [AreaKey, typeof areaMeta[string]][];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">Acudiente</span>
          <button
            onClick={onLogout}
            className="p-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* Student selector */}
        {allStudents.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold text-slate-600 mb-2">Selecciona al niño</label>
            <div className="flex gap-3">
              {allStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStudentId(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition ${
                    s.id === student.id
                      ? "border-pink-400 bg-pink-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">{s.avatar}</span>
                  <span className="text-sm font-bold text-slate-600">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Student overview */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-4xl">
              {student.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-slate-700">{student.name}</h1>
              <p className="text-sm text-slate-400">{student.age} años</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-600">Progreso general</span>
              <span className="text-sm font-extrabold text-pink-500">{student.progress}%</span>
            </div>
            <ProgressBar value={student.progress} color="from-pink-400 to-rose-400" size="lg" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-pink-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{student.progress}%</p>
            <p className="text-xs text-slate-400">Avance</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{student.activitiesCompleted}</p>
            <p className="text-xs text-slate-400">Actividades</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{student.achievements.length}</p>
            <p className="text-xs text-slate-400">Logros</p>
          </div>
        </div>

        {/* Guidance */}
        <button
          onClick={onAssistant}
          className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.01] active:scale-95 transition text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-7 h-7 text-sky-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-slate-700">Orientaciones para acompañar</h2>
            <p className="text-sm text-slate-500">Ideas sencillas para practicar en casa.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        </button>

        {/* Area progress */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-700 mb-4">Áreas trabajadas</h3>
          <div className="space-y-4">
            {areas.map(([key, meta]) => (
              <div key={key} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {meta.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-slate-600">{meta.label}</span>
                    <span className="text-sm font-bold text-slate-400">{student.areaProgress[key]}%</span>
                  </div>
                  <ProgressBar value={student.areaProgress[key]} color={meta.bg} />
                  <p className="text-xs text-slate-400 mt-1">
                    {student.areaActivities[key]} actividades realizadas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-slate-700">Logros obtenidos</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {student.achievements.map((a) => (
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
      </div>
    </div>
  );
}
