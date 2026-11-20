// InstructorGestion.tsx
import { useEffect, useState } from "react";
import { ArrowLeft, Link2, Award, Trash2 } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/services/api";

interface Props {
  onBack: () => void;
}

interface EstudianteLista {
  estudiantes_id: number;
  nombre: string;
  apellido: string;
  avatar: string | null;
  grado: string | null;
  edad: number;
}
interface AcudienteLista {
  acudientes_id: number;
  nombre: string;
  apellido: string;
  correo: string;
}
interface Vinculo {
  acudiente_estudiante_id: number;
  acudientes_id: number;
  acudiente_nombre: string;
  estudiantes_id: number;
  estudiante_nombre: string;
  parentesco: string | null;
}
interface LogroCatalogo {
  logros_id: number;
  nombre: string;
  descripcion: string | null;
}
interface LogroEstudiante {
  nombre: string;
  descripcion: string | null;
  fecha_obtencion: string;
}

const selectClase =
  "w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 focus:border-amber-400 focus:outline-none transition";
const botonClase =
  "w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-extrabold shadow-sm hover:shadow-md active:scale-95 transition disabled:opacity-50";

export default function InstructorGestion({ onBack }: Props) {
  const [estudiantes, setEstudiantes] = useState<EstudianteLista[]>([]);
  const [acudientes, setAcudientes] = useState<AcudienteLista[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [catalogo, setCatalogo] = useState<LogroCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Formulario de vínculo
  const [acudienteSel, setAcudienteSel] = useState("");
  const [estudianteSel, setEstudianteSel] = useState("");
  const [parentesco, setParentesco] = useState("");

  // Formulario de insignias
  const [estLogroSel, setEstLogroSel] = useState("");
  const [logroSel, setLogroSel] = useState("");
  const [logrosDelEst, setLogrosDelEst] = useState<LogroEstudiante[]>([]);

  const avisar = (texto: string) => {
    setError("");
    setMensaje(texto);
  };
  const fallar = (e: unknown) => {
    setMensaje("");
    setError(e instanceof Error ? e.message : "Ocurrió un error");
  };

  const recargarVinculos = async () => {
    setVinculos(await apiGet<Vinculo[]>("/instructores/vinculos"));
  };

  const recargarLogrosDelEst = async (id: string) => {
    if (!id) {
      setLogrosDelEst([]);
      return;
    }
    setLogrosDelEst(await apiGet<LogroEstudiante[]>(`/instructores/estudiantes/${id}/logros`));
  };

  // Carga inicial: estudiantes, acudientes, vínculos y catálogo de insignias
  useEffect(() => {
    Promise.all([
      apiGet<EstudianteLista[]>("/instructores/estudiantes"),
      apiGet<AcudienteLista[]>("/instructores/acudientes"),
      apiGet<Vinculo[]>("/instructores/vinculos"),
      apiGet<LogroCatalogo[]>("/instructores/logros"),
    ])
      .then(([est, acu, vin, cat]) => {
        setEstudiantes(est);
        setAcudientes(acu);
        setVinculos(vin);
        setCatalogo(cat);
        setCargando(false);
      })
      .catch((e) => {
        fallar(e);
        setCargando(false);
      });
  }, []);

  // Cuando cambia el estudiante elegido para insignias, se cargan las que ya tiene
  useEffect(() => {
    recargarLogrosDelEst(estLogroSel).catch(fallar);
  }, [estLogroSel]);

  const crearVinculo = async () => {
    if (!acudienteSel || !estudianteSel) {
      fallar(new Error("Elige un acudiente y un estudiante"));
      return;
    }
    try {
      const nuevo = await apiPost<Vinculo>("/instructores/vinculos", {
        acudientes_id: Number(acudienteSel),
        estudiantes_id: Number(estudianteSel),
        parentesco: parentesco.trim() || null,
      });
      await recargarVinculos();
      setParentesco("");
      avisar(`Vinculado: ${nuevo.estudiante_nombre} con ${nuevo.acudiente_nombre}`);
    } catch (e) {
      fallar(e);
    }
  };

  const quitarVinculo = async (v: Vinculo) => {
    const ok = window.confirm(`¿Quitar el vínculo de ${v.estudiante_nombre} con ${v.acudiente_nombre}?`);
    if (!ok) return;
    try {
      await apiDelete(`/instructores/vinculos/${v.acudiente_estudiante_id}`);
      await recargarVinculos();
      avisar("Vínculo quitado");
    } catch (e) {
      fallar(e);
    }
  };

  const otorgarInsignia = async () => {
    if (!estLogroSel || !logroSel) {
      fallar(new Error("Elige un estudiante y una insignia"));
      return;
    }
    try {
      const otorgado = await apiPost<LogroEstudiante>(
        `/instructores/estudiantes/${estLogroSel}/logros`,
        { logros_id: Number(logroSel) },
      );
      await recargarLogrosDelEst(estLogroSel);
      avisar(`Insignia otorgada: ${otorgado.nombre}`);
    } catch (e) {
      fallar(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Volver al panel"
          className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700">Gestión</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {error && <div className="bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl p-3">{error}</div>}
        {mensaje && (
          <div className="bg-green-50 text-green-700 text-sm font-bold rounded-2xl p-3">{mensaje}</div>
        )}

        {cargando ? (
          <p className="text-center text-slate-500 font-bold mt-10">Cargando...</p>
        ) : (
          <>
            {/* Vínculos */}
            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-amber-500" />
                <h2 className="font-extrabold text-slate-700">Vincular niño con acudiente</h2>
              </div>

              <select value={acudienteSel} onChange={(e) => setAcudienteSel(e.target.value)} className={selectClase}>
                <option value="">Acudiente...</option>
                {acudientes.map((a) => (
                  <option key={a.acudientes_id} value={a.acudientes_id}>
                    {a.nombre} {a.apellido} ({a.correo})
                  </option>
                ))}
              </select>

              <select value={estudianteSel} onChange={(e) => setEstudianteSel(e.target.value)} className={selectClase}>
                <option value="">Estudiante...</option>
                {estudiantes.map((s) => (
                  <option key={s.estudiantes_id} value={s.estudiantes_id}>
                    {s.avatar} {s.nombre} {s.apellido}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                placeholder="Parentesco (opcional: Madre, Padre, Tío...)"
                maxLength={50}
                className={selectClase}
              />

              <button onClick={crearVinculo} className={botonClase}>
                Vincular
              </button>

              <div className="pt-2 space-y-2">
                <h3 className="text-sm font-bold text-slate-500">Vínculos actuales</h3>
                {vinculos.length === 0 && <p className="text-sm text-slate-400">No hay vínculos.</p>}
                {vinculos.map((v) => (
                  <div
                    key={v.acudiente_estudiante_id}
                    className="flex items-center justify-between gap-3 bg-amber-50 rounded-2xl p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{v.estudiante_nombre}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {v.acudiente_nombre}
                        {v.parentesco ? ` · ${v.parentesco}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => quitarVinculo(v)}
                      aria-label={`Quitar vínculo de ${v.estudiante_nombre}`}
                      className="p-2 rounded-full bg-white text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Insignias */}
            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="font-extrabold text-slate-700">Dar insignias</h2>
              </div>

              <select value={estLogroSel} onChange={(e) => setEstLogroSel(e.target.value)} className={selectClase}>
                <option value="">Estudiante...</option>
                {estudiantes.map((s) => (
                  <option key={s.estudiantes_id} value={s.estudiantes_id}>
                    {s.avatar} {s.nombre} {s.apellido}
                  </option>
                ))}
              </select>

              <select value={logroSel} onChange={(e) => setLogroSel(e.target.value)} className={selectClase}>
                <option value="">Insignia...</option>
                {catalogo.map((l) => (
                  <option key={l.logros_id} value={l.logros_id}>
                    {l.nombre}
                  </option>
                ))}
              </select>

              <button onClick={otorgarInsignia} className={botonClase}>
                Otorgar insignia
              </button>

              {estLogroSel && (
                <div className="pt-2">
                  <h3 className="text-sm font-bold text-slate-500 mb-2">Insignias del estudiante</h3>
                  <div className="flex flex-wrap gap-2">
                    {logrosDelEst.length === 0 && <p className="text-sm text-slate-400">Aún no tiene insignias.</p>}
                    {logrosDelEst.map((l, i) => (
                      <span
                        key={`${l.nombre}-${i}`}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-bold rounded-full flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        {l.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}