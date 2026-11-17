// frontend/src/components/Login.tsx
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, GraduationCap, Users, Presentation, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { useApp } from "../store";
import { apiGet, apiPost } from "../services/api";
import type { AreaKey, Role } from "../types";

interface LoginRespuesta {
  access_token: string;
  token_type: string;
  rol: "ESTUDIANTE" | "ACUDIENTE" | "INSTRUCTOR";
  usuario: { nombre: string; apellido: string; correo: string; usuarios_id: number };
}

interface PerfilEstudiante {
  estudiantes_id: number;
  nombre: string;
  apellido: string;
  avatar: string;
  grado: string | null;
  edad: number;
}

interface ProgresoRespuesta {
  progreso_general: number;
  actividades_completadas: number;
  modulos: {
    codigo: AreaKey;
    nombre: string;
    porcentaje: number;
    actividades_completadas: number;
  }[];
}

interface LogroRespuesta {
  nombre: string;
  descripcion: string | null;
  fecha_obtencion: string;
}

// Traduce el rol de la base de datos al rol que usa el front
const ROL_BACK_A_FRONT: Record<LoginRespuesta["rol"], Role> = {
  ESTUDIANTE: "student",
  ACUDIENTE: "guardian",
  INSTRUCTOR: "instructor",
};

export default function Login() {
  const { setRole, setCurrentUser, setCurrentStudentId, allStudents, updateStudent } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [showRecover, setShowRecover] = useState(false);

  const [cargando, setCargando] = useState(false);

  const roles: { key: Role; label: string; icon: typeof GraduationCap; color: string }[] = [
    { key: "student", label: "Estudiante", icon: GraduationCap, color: "from-sky-400 to-blue-500" },
    { key: "guardian", label: "Acudiente", icon: Users, color: "from-pink-400 to-rose-500" },
    { key: "instructor", label: "Instructor", icon: Presentation, color: "from-amber-400 to-orange-500" },
  ];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }
    if (!selectedRole) {
      setError("Selecciona tu tipo de usuario");
      return;
    }

    setError("");
    setCargando(true);
    try {
      const datos = await apiPost<LoginRespuesta>("/auth/login", {
        correo: email.trim(),
        password,
      });

      // El rol real lo decide el back, no el botón que se eligió
      const rolReal = ROL_BACK_A_FRONT[datos.rol];
      if (rolReal !== selectedRole) {
        setError("Ese usuario no corresponde al tipo seleccionado");
        return;
      }

      localStorage.setItem("lakid_token", datos.access_token);

      if (rolReal === "student") {
        const perfil = await apiGet<PerfilEstudiante>("/estudiantes/me");
        const progreso = await apiGet<ProgresoRespuesta>("/estudiantes/me/progreso");
        const logros = await apiGet<LogroRespuesta[]>("/estudiantes/me/logros");
        const idFront = `s${perfil.estudiantes_id}`;

        // Convierte la lista del back en el formato que usa el front
        const areaProgress = {} as Record<AreaKey, number>;
        const areaActivities = {} as Record<AreaKey, number>;
        for (const m of progreso.modulos) {
          areaProgress[m.codigo] = m.porcentaje;
          areaActivities[m.codigo] = m.actividades_completadas;
        }

        updateStudent(idFront, {
          areaProgress,
          areaActivities,
          progress: progreso.progreso_general,
          activitiesCompleted: progreso.actividades_completadas,
          achievements: logros.map((l) => l.nombre),
        });
        setCurrentStudentId(idFront);
      } else {
        // Temporal hasta tener los endpoints de acudiente e instructor
        setCurrentStudentId(allStudents[0].id);
      }

      setCurrentUser(`${datos.usuario.nombre} ${datos.usuario.apellido}`);
      setRole(rolReal);
    } catch (e) {
      localStorage.removeItem("lakid_token");
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Decorative shapes */}
      <div className="fixed top-10 left-10 text-6xl opacity-20 animate-pulse">🌈</div>
      <div className="fixed bottom-10 right-10 text-6xl opacity-20 animate-pulse">⭐</div>
      <div className="fixed top-1/4 right-10 text-5xl opacity-15">☁️</div>
      <div className="fixed bottom-1/4 left-10 text-5xl opacity-15">🌸</div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Logo size="lg" />
          <p className="text-slate-400 text-sm mt-2 text-center font-medium">
            Aprende, juega y crece con nosotros
          </p>
        </div>

        {showRecover ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-700 text-center">Recuperar contraseña</h2>
            <p className="text-sm text-slate-500 text-center">
              Ingresa tu correo y te enviaremos las instrucciones
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition text-slate-700"
              />
            </div>
            <button
              onClick={() => setShowRecover(false)}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition"
            >
              Enviar instrucciones
            </button>
            <button
              onClick={() => setShowRecover(false)}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">¿Quién eres?</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const active = selectedRole === r.key;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setSelectedRole(r.key)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition ${
                        active
                          ? `border-transparent bg-gradient-to-br ${r.color} text-white shadow-lg scale-105`
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo o usuario"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition text-slate-700"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Contraseña"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none transition text-slate-700"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center font-medium">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={cargando}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {cargando ? "Entrando..." : "Iniciar sesión"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowRecover(true)}
              className="w-full text-center text-sm text-slate-400 hover:text-sky-500 transition font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
