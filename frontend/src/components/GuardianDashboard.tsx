// GuardianDashboard.tsx
import { useEffect, useState } from "react";
import { LogOut, TrendingUp, BookOpen, Award, Bot, ChevronRight } from "lucide-react";
import { useApp } from "../store";
import { areaMeta } from "../data";
import { apiGet } from "../services/api";
import { Logo } from "./Logo";
import ProgressBar from "./ProgressBar";
import type { AreaKey } from "../types";

interface Props {
  onAssistant: () => void;
  onLogout: () => void;
}

// Formas de lo que responde el back (/acudientes/me/...)
interface EstudianteApi {
  estudiantes_id: number;
  nombre: string;
  apellido: string;
  avatar: string;
  grado: string;
  edad: number;
}
interface ModuloApi {
  codigo: string;
  nombre: string;
  porcentaje: number;
  actividades_completadas: number;
}
interface ProgresoApi {
  progreso_general: number;
  actividades_completadas: number;
  modulos: ModuloApi[];
}
type LogroApi = Record<string, unknown>;

// Saca un texto legible de cada logro, sin depender del nombre exacto del campo
function nombreLogro(l: LogroApi): string {
  const texto = l.nombre ?? l.titulo ?? l.name ?? l.descripcion ?? "Logro";
  return String(texto);
}

export default function GuardianDashboard({ onAssistant, onLogout }: Props) {
  const { currentUser } = useApp();
  const areas = Object.entries(areaMeta) as [AreaKey, typeof areaMeta[string]][];

  const [estudiantes, setEstudiantes] = useState<EstudianteApi[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [progreso, setProgreso] = useState<ProgresoApi | null>(null);
  const [logros, setLogros] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // 1. Pide SOLO los niños vinculados a este acudiente
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    apiGet<EstudianteApi[]>("/acudientes/me/estudiantes")
      .then((lista) => {
        if (cancelado) return;
        setEstudiantes(lista);
        setSeleccionado(lista.length > 0 ? lista[0].estudiantes_id : null);
        setCargando(false);
      })
      .catch((e: Error) => {
        if (cancelado) return;
        setError(e.message);
        setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // 2. Cuando hay un niño seleccionado, pide su progreso y sus logros
  useEffect(() => {
    if (seleccionado === null) return;
    let cancelado = false;
    setError("");
    Promise.all([
      apiGet<ProgresoApi>(`/acudientes/me/estudiantes/${seleccionado}/progreso`),
      apiGet<LogroApi[]>(`/acudientes/me/estudiantes/${seleccionado}/logros`),
    ])
      .then(([prog, logs]) => {
        if (cancelado) return;
        setProgreso(prog);
        setLogros(logs.map(nombreLogro));
      })
      .catch((e: Error) => {
        if (cancelado) return;
        setError(e.message);
      });
    return () => {
      cancelado = true;
    };
  }, [seleccionado]);

  const estudiante = estudiantes.find((s) => s.estudiantes_id === seleccionado) ?? null;

  const encabezado = (
    <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
      <Logo size="sm" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-400">{currentUser || "Acudiente"}</span>
        <button
          onClick={onLogout}
          className="p-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50">
        {encabezado}
        <p className="text-center text-slate-500 font-bold mt-10">Cargando...</p>
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50">
        {encabezado}
        <div className="max-w-2xl mx-auto px-5 py-10 text-center">
          <p className="text-slate-600 font-bold">
            {error || "Todavía no tienes niños vinculados a tu cuenta."}
          </p>
        </div>
      </div>
    );
  }

  const progresoGeneral = progreso?.progreso_general ?? 0;
  const actividades = progreso?.actividades_completadas ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50">
      {encabezado}

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl p-3">{error}</div>
        )}

        {/* Selector: solo aparece si el acudiente tiene más de un niño vinculado */}
        {estudiantes.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-bold text-slate-600 mb-2">Selecciona al niño</label>
            <div className="flex gap-3">
              {estudiantes.map((s) => (
                <button
                  key={s.estudiantes_id}
                  onClick={() => setSeleccionado(s.estudiantes_id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition ${
                    s.estudiantes_id === estudiante.estudiantes_id
                      ? "border-pink-400 bg-pink-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">{s.avatar}</span>
                  <span className="text-sm font-bold text-slate-600">{s.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resumen del niño */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-4xl">
              {estudiante.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-slate-700">
                {estudiante.nombre} {estudiante.apellido}
              </h1>
              <p className="text-sm text-slate-400">
                {estudiante.edad} años · {estudiante.grado}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-600">Progreso general</span>
              <span className="text-sm font-extrabold text-pink-500">{progresoGeneral}%</span>
            </div>
            <ProgressBar value={progresoGeneral} color="from-pink-400 to-rose-400" size="lg" />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-pink-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{progresoGeneral}%</p>
            <p className="text-xs text-slate-400">Avance</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <BookOpen className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{actividades}</p>
            <p className="text-xs text-slate-400">Actividades</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-extrabold text-slate-700">{logros.length}</p>
            <p className="text-xs text-slate-400">Logros</p>
          </div>
        </div>

        {/* Orientaciones */}
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

        {/* Progreso por área */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-extrabold text-slate-700 mb-4">Áreas trabajadas</h3>
          <div className="space-y-4">
            {areas.map(([key, meta]) => {
              const modulo = progreso?.modulos.find((m) => m.codigo === key);
              const porcentaje = modulo?.porcentaje ?? 0;
              const hechas = modulo?.actividades_completadas ?? 0;
              return (
                <div key={key} className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.bg} flex items-center justify-center text-2xl flex-shrink-0`}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-slate-600">{meta.label}</span>
                      <span className="text-sm font-bold text-slate-400">{porcentaje}%</span>
                    </div>
                    <ProgressBar value={porcentaje} color={meta.bg} />
                    <p className="text-xs text-slate-400 mt-1">{hechas} actividades realizadas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logros */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-slate-700">Logros obtenidos</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {logros.length === 0 && (
              <p className="text-sm text-slate-400">Aún no hay logros registrados.</p>
            )}
            {logros.map((nombre, i) => (
              <span
                key={`${nombre}-${i}`}
                className="px-3 py-1.5 bg-amber-50 text-amber-600 text-sm font-bold rounded-full flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                {nombre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}