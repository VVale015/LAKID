import { apiPost } from "./api";
import type { AreaKey, Student } from "../types";

// Mientras la pantalla de cada área no sepa qué actividad exacta de la
// biblioteca hace el niño, se usa la actividad básica del área.
const ACTIVIDAD_POR_AREA: Record<AreaKey, string> = {
  colors: "colors-basic",
  alphabet: "alphabet-letters",
  reading: "reading-rabbit",
  games: "games-pairs",
};

export interface ProgresoRespuesta {
  progreso_general: number;
  actividades_completadas: number;
  modulos: {
    codigo: AreaKey;
    nombre: string;
    porcentaje: number;
    actividades_completadas: number;
  }[];
}

interface ResultadoRespuesta {
  numero_intento: number;
  asignacion_completada: boolean;
  progreso: ProgresoRespuesta;
}

// Convierte el progreso del back en los campos que usa el estudiante del front
export function progresoAEstudiante(progreso: ProgresoRespuesta): Partial<Student> {
  const areaProgress = {} as Record<AreaKey, number>;
  const areaActivities = {} as Record<AreaKey, number>;
  for (const m of progreso.modulos) {
    areaProgress[m.codigo] = m.porcentaje;
    areaActivities[m.codigo] = m.actividades_completadas;
  }
  return {
    areaProgress,
    areaActivities,
    progress: progreso.progreso_general,
    activitiesCompleted: progreso.actividades_completadas,
  };
}

// Envía al back el resultado de una actividad (porcentaje de 0 a 100)
export async function registrarResultado(
  area: AreaKey,
  porcentaje: number,
): Promise<ResultadoRespuesta> {
  return apiPost<ResultadoRespuesta>("/estudiantes/me/resultados", {
    actividad_codigo: ACTIVIDAD_POR_AREA[area],
    porcentaje,
  });
}