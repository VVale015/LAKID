import { ArrowLeft, TrendingUp, BookOpen, Award } from "lucide-react";
import { areaMeta } from "@/data";
import ProgressBar from "@/components/ProgressBar";
import type { AreaKey, Student } from "@/types";
import AssignmentTracker from "./AssignmentTracker";

interface Props {
  student: Student;
  onBack: () => void;
}

const areas = Object.entries(areaMeta) as [AreaKey, (typeof areaMeta)[string]][];

export default function StudentDetail({ student, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Volver a la lista de estudiantes"
          className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700">{student.name}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl">
              {student.avatar}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-700">{student.name}</h2>
              <p className="text-sm text-slate-500">{student.age} años</p>
            </div>
          </div>
          <ProgressBar value={student.progress} color="from-amber-400 to-orange-400" size="lg" showLabel />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{student.progress}%</p>
            <p className="text-xs text-slate-500">Avance</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{student.activitiesCompleted}</p>
            <p className="text-xs text-slate-500">Actividades</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Award className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{student.achievements.length}</p>
            <p className="text-xs text-slate-500">Logros</p>
          </div>
        </div>

        <AssignmentTracker studentId={student.id} studentName={student.name} />

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-700 mb-4">Resultados por módulo</h3>
          <div className="space-y-4">
            {areas.map(([key, meta]) => (
              <div key={key} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {meta.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-slate-600">{meta.label}</span>
                    <span className="text-sm font-bold text-slate-500">{student.areaProgress[key]}%</span>
                  </div>
                  <ProgressBar value={student.areaProgress[key]} color={meta.bg} />
                  <p className="text-xs text-slate-500 mt-1">
                    {student.areaActivities[key]} actividades realizadas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-700">Logros</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {student.achievements.map((a) => (
              <span key={a} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-bold rounded-full flex items-center gap-1">
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
