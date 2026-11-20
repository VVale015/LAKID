// Registro.tsx
import { useState } from "react";
import { ArrowLeft, Users, Presentation } from "lucide-react";
import { Logo } from "./Logo";
import { apiPost } from "../services/api";

type TipoRegistro = "acudiente" | "instructor";

interface Props {
  onBack: () => void;
}

interface RegistroRespuesta {
  mensaje: string;
  correo: string;
}

const inputClase =
  "w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition text-slate-700";

export default function Registro({ onBack }: Props) {
  const [tipo, setTipo] = useState<TipoRegistro>("acudiente");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [codigo, setCodigo] = useState("");

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  const validar = (): string | null => {
    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      return "Escribe tu nombre y tu apellido";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      return "Escribe un correo válido";
    }
    if (password.length < 8) {
      return "La contraseña debe tener mínimo 8 caracteres";
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return "La contraseña debe tener letras y números";
    }
    if (password !== confirmar) {
      return "Las contraseñas no coinciden";
    }
    if (tipo === "instructor" && !codigo.trim()) {
      return "Escribe el código de invitación";
    }
    return null;
  };

  const enviar = async () => {
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const base = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        password,
        confirmar_password: confirmar,
      };
      const cuerpo =
        tipo === "acudiente"
          ? { ...base, telefono: telefono.trim() || null, parentesco: parentesco.trim() || null }
          : { ...base, especialidad: especialidad.trim() || null, codigo_invitacion: codigo.trim() };

      const r = await apiPost<RegistroRespuesta>(`/registro/${tipo}`, cuerpo);
      setExito(r.mensaje);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el registro");
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-5">
          <Logo size="lg" />
          <p className="text-slate-700 font-bold">{exito}</p>
          <button
            onClick={onBack}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Volver al inicio de sesión"
            className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-700">Crear cuenta</h1>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTipo("acudiente")}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition ${
              tipo === "acudiente"
                ? "border-transparent bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-bold">Acudiente</span>
          </button>
          <button
            onClick={() => setTipo("instructor")}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition ${
              tipo === "instructor"
                ? "border-transparent bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <Presentation className="w-6 h-6" />
            <span className="text-xs font-bold">Instructor</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input className={inputClase} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} />
          <input className={inputClase} placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} maxLength={100} />
        </div>

        <input className={inputClase} type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />

        <input className={inputClase} type={mostrar ? "text" : "password"} placeholder="Contraseña (mínimo 8, con letras y números)" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72} />
        <input className={inputClase} type={mostrar ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} maxLength={72} />

        <label className="flex items-center gap-2 text-sm text-slate-500">
          <input type="checkbox" checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} />
          Mostrar contraseñas
        </label>

        {tipo === "acudiente" ? (
          <>
            <input className={inputClase} placeholder="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={30} />
            <input className={inputClase} placeholder="Parentesco (Madre, Padre, Tío...)" value={parentesco} onChange={(e) => setParentesco(e.target.value)} maxLength={50} />
            <p className="text-xs text-slate-500">
              Tu cuenta quedará pendiente hasta que un instructor la apruebe.
            </p>
          </>
        ) : (
          <>
            <input className={inputClase} placeholder="Especialidad (opcional)" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} maxLength={100} />
            <input className={inputClase} type="password" autoComplete="off" placeholder="Código de invitación" value={codigo} onChange={(e) => setCodigo(e.target.value)} maxLength={100} />
          </>
        )}

        {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

        <button
          onClick={enviar}
          disabled={enviando}
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Registrarme"}
        </button>
      </div>
    </div>
  );
}