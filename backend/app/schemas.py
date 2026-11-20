# app/schemas.py
"""
Esquemas Pydantic (v2) de LAKID. Cada grupo corresponde a una tabla de base_datos.sql.
Convención:
  XBase    -> campos comunes
  XCreate  -> lo que el cliente envía para crear
  XUpdate  -> campos opcionales para actualizar
  XOut     -> lo que la API devuelve (incluye ids, status y fechas)
"""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class ORMModel(BaseModel):
    """Permite construir el esquema directamente desde un modelo SQLAlchemy."""
    model_config = ConfigDict(from_attributes=True)


# ============================================================
# ROLES
# ============================================================
class RolBase(BaseModel):
    nombre: str = Field(..., max_length=30)
    descripcion: Optional[str] = Field(None, max_length=150)


class RolCreate(RolBase):
    pass


class RolUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=30)
    descripcion: Optional[str] = Field(None, max_length=150)
    status: Optional[bool] = None


class RolOut(RolBase, ORMModel):
    roles_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# ============================================================
# USUARIOS  (password_hash NUNCA se expone)
# ============================================================
class UsuarioBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    apellido: str = Field(..., max_length=100)
    correo: EmailStr


class UsuarioCreate(UsuarioBase):
    roles_id: int
    password: str = Field(..., min_length=8, max_length=72)  # bcrypt admite máx. 72 bytes


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    apellido: Optional[str] = Field(None, max_length=100)
    correo: Optional[EmailStr] = None
    roles_id: Optional[int] = None
    password: Optional[str] = Field(None, min_length=8, max_length=72)
    status: Optional[bool] = None


class UsuarioOut(UsuarioBase, ORMModel):
    usuarios_id: int
    roles_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# ============================================================
# AUTENTICACIÓN
# ============================================================
class LoginRequest(BaseModel):
    correo: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    usuario: UsuarioOut


# ============================================================
# ESTUDIANTES
# ============================================================
class EstudianteBase(BaseModel):
    fecha_nacimiento: date
    grado: Optional[str] = Field(None, max_length=50)
    observaciones: Optional[str] = None


class EstudianteCreate(EstudianteBase):
    usuarios_id: int


class EstudianteUpdate(BaseModel):
    fecha_nacimiento: Optional[date] = None
    grado: Optional[str] = Field(None, max_length=50)
    observaciones: Optional[str] = None
    status: Optional[bool] = None


class EstudianteOut(EstudianteBase, ORMModel):
    estudiantes_id: int
    usuarios_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# ============================================================
# ACUDIENTES
# ============================================================
class AcudienteBase(BaseModel):
    telefono: Optional[str] = Field(None, max_length=30)
    parentesco: Optional[str] = Field(None, max_length=50)


class AcudienteCreate(AcudienteBase):
    usuarios_id: int


class AcudienteUpdate(AcudienteBase):
    status: Optional[bool] = None


class AcudienteOut(AcudienteBase, ORMModel):
    acudientes_id: int
    usuarios_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# Relación acudiente <-> estudiante
class AcudienteEstudianteCreate(BaseModel):
    acudientes_id: int
    estudiantes_id: int
    parentesco: Optional[str] = Field(None, max_length=50)


class AcudienteEstudianteOut(AcudienteEstudianteCreate, ORMModel):
    acudiente_estudiante_id: int
    status: bool
    fecha_asociacion: datetime


# ============================================================
# INSTRUCTORES
# ============================================================
class InstructorBase(BaseModel):
    especialidad: Optional[str] = Field(None, max_length=100)


class InstructorCreate(InstructorBase):
    usuarios_id: int


class InstructorUpdate(InstructorBase):
    status: Optional[bool] = None


class InstructorOut(InstructorBase, ORMModel):
    instructores_id: int
    usuarios_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# Relación instructor <-> estudiante
class InstructorEstudianteCreate(BaseModel):
    instructores_id: int
    estudiantes_id: int


class InstructorEstudianteOut(InstructorEstudianteCreate, ORMModel):
    instructor_estudiante_id: int
    status: bool
    fecha_asignacion: datetime


# ============================================================
# MÓDULOS (Colores, Abecedario, Lecturas cortas, Juegos)
# ============================================================
class ModuloBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: Optional[str] = None
    icono: Optional[str] = Field(None, max_length=255)
    orden: int = 1


class ModuloCreate(ModuloBase):
    pass


class ModuloUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = None
    icono: Optional[str] = Field(None, max_length=255)
    orden: Optional[int] = None
    status: Optional[bool] = None


class ModuloOut(ModuloBase, ORMModel):
    modulos_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# ============================================================
# OPCIONES
# ============================================================
class OpcionBase(BaseModel):
    texto: str
    es_correcta: bool = False
    orden: int = 1


class OpcionCreate(OpcionBase):
    preguntas_id: int


class OpcionUpdate(BaseModel):
    texto: Optional[str] = None
    es_correcta: Optional[bool] = None
    orden: Optional[int] = None
    status: Optional[bool] = None


class OpcionOut(OpcionBase, ORMModel):
    """Versión para instructores: incluye es_correcta."""
    opciones_id: int
    preguntas_id: int
    status: bool


class OpcionPublic(ORMModel):
    """Versión para el estudiante: NO revela cuál es la correcta."""
    opciones_id: int
    texto: str
    orden: int


# ============================================================
# PREGUNTAS
# ============================================================
class PreguntaBase(BaseModel):
    enunciado: str
    tipo: str = Field(..., max_length=50)  # ej: OPCION_MULTIPLE
    orden: int = 1
    puntuacion: float = Field(1, ge=0)


class PreguntaCreate(PreguntaBase):
    actividades_id: int


class PreguntaUpdate(BaseModel):
    enunciado: Optional[str] = None
    tipo: Optional[str] = Field(None, max_length=50)
    orden: Optional[int] = None
    puntuacion: Optional[float] = Field(None, ge=0)
    status: Optional[bool] = None


class PreguntaOut(PreguntaBase, ORMModel):
    preguntas_id: int
    actividades_id: int
    status: bool


class PreguntaPublic(ORMModel):
    """Pregunta con sus opciones, sin respuestas correctas (para el estudiante)."""
    preguntas_id: int
    enunciado: str
    tipo: str
    orden: int
    puntuacion: float
    opciones: list[OpcionPublic] = []


# ============================================================
# ACTIVIDADES
# ============================================================
class ActividadBase(BaseModel):
    titulo: str = Field(..., max_length=150)
    descripcion: Optional[str] = None
    instrucciones: Optional[str] = None
    tipo: str = Field(..., max_length=50)  # ej: SELECCION, COMPRENSION, JUEGO
    nivel_dificultad: str = Field("BASICO", max_length=30)
    puntuacion_maxima: float = Field(100, ge=0)
    orden: int = 1


class ActividadCreate(ActividadBase):
    modulos_id: int


class ActividadUpdate(BaseModel):
    titulo: Optional[str] = Field(None, max_length=150)
    descripcion: Optional[str] = None
    instrucciones: Optional[str] = None
    tipo: Optional[str] = Field(None, max_length=50)
    nivel_dificultad: Optional[str] = Field(None, max_length=30)
    puntuacion_maxima: Optional[float] = Field(None, ge=0)
    orden: Optional[int] = None
    status: Optional[bool] = None


class ActividadOut(ActividadBase, ORMModel):
    actividades_id: int
    modulos_id: int
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


class ActividadDetalle(ActividadOut):
    """Actividad con preguntas y opciones listas para que el estudiante la resuelva."""
    preguntas: list[PreguntaPublic] = []


# ============================================================
# INTENTOS Y RESPUESTAS
# ============================================================
class RespuestaCreate(BaseModel):
    preguntas_id: int
    opciones_id: Optional[int] = None
    respuesta_texto: Optional[str] = None

    @model_validator(mode="after")
    def debe_tener_respuesta(self):
        if self.opciones_id is None and not self.respuesta_texto:
            raise ValueError("Debe enviar opciones_id o respuesta_texto")
        return self


class RespuestaOut(ORMModel):
    respuestas_id: int
    intentos_id: int
    preguntas_id: int
    opciones_id: Optional[int] = None
    respuesta_texto: Optional[str] = None
    es_correcta: Optional[bool] = None
    puntaje_obtenido: Optional[float] = 0
    fecha_respuesta: datetime


class IntentoCreate(BaseModel):
    """Inicia un intento. numero_intento lo calcula el servidor."""
    estudiantes_id: int
    actividades_id: int


class IntentoFinalizar(BaseModel):
    """Envía todas las respuestas del estudiante para calificar el intento."""
    respuestas: list[RespuestaCreate] = Field(..., min_length=1)


class IntentoOut(ORMModel):
    intentos_id: int
    estudiantes_id: int
    actividades_id: int
    numero_intento: int
    puntaje: float
    porcentaje: float = Field(..., ge=0, le=100)
    estado: str  # INICIADO, FINALIZADO...
    fecha_inicio: datetime
    fecha_finalizacion: Optional[datetime] = None


class IntentoResultado(IntentoOut):
    respuestas: list[RespuestaOut] = []


# ============================================================
# PROGRESO
# ============================================================
class ProgresoCreate(BaseModel):
    estudiantes_id: int
    modulos_id: int


class ProgresoOut(ORMModel):
    progreso_id: int
    estudiantes_id: int
    modulos_id: int
    actividades_completadas: int
    actividades_totales: int
    porcentaje: float = Field(..., ge=0, le=100)
    ultima_actividad: Optional[datetime] = None
    status: bool
    fecha_creacion: datetime
    fecha_actualizacion: datetime


# ============================================================
# RECOMENDACIONES IA
# ============================================================
class RecomendacionCreate(BaseModel):
    estudiantes_id: int
    modulos_id: Optional[int] = None
    tipo: str = Field(..., max_length=50)  # ej: REFUERZO
    recomendacion: str
    motivo: Optional[str] = None
    nivel_prioridad: str = Field("MEDIA", max_length=20)


class RecomendacionUpdate(BaseModel):
    atendida: Optional[bool] = None
    status: Optional[bool] = None


class RecomendacionOut(RecomendacionCreate, ORMModel):
    recomendaciones_ia_id: int
    status: bool
    atendida: bool
    fecha_generacion: datetime
    
class EstudianteOut(BaseModel):
    estudiantes_id: int
    nombre: str
    apellido: str
    avatar: str
    grado: str | None = None
    edad: int

class ProgresoModuloOut(BaseModel):
    codigo: str  # colors, alphabet, reading, games
    nombre: str
    porcentaje: float
    actividades_completadas: int

class ProgresoOut(BaseModel):
    progreso_general: int
    actividades_completadas: int
    modulos: list[ProgresoModuloOut]
    
class LogroOut(BaseModel):
    nombre: str
    descripcion: str | None = None
    fecha_obtencion: datetime
    
class ResultadoRequest(BaseModel):
    actividad_codigo: str  # ej. "colors-basic"
    porcentaje: float = Field(ge=0, le=100)  # resultado del niño, de 0 a 100


class ResultadoOut(BaseModel):
    numero_intento: int
    asignacion_completada: bool
    progreso: ProgresoOut  # el progreso ya actualizado  
# ============================================================
# INSTRUCTOR: listas y vínculos
# ============================================================
class EstudianteListaOut(BaseModel):
    estudiantes_id: int
    nombre: str
    apellido: str
    avatar: str | None = None
    grado: str | None = None
    edad: int

class AcudienteListaOut(BaseModel):
    acudientes_id: int
    nombre: str
    apellido: str
    correo: str

class VinculoRequest(BaseModel):
    acudientes_id: int
    estudiantes_id: int
    parentesco: str | None = Field(None, max_length=50)

class VinculoOut(BaseModel):
    acudiente_estudiante_id: int
    acudientes_id: int
    acudiente_nombre: str
    estudiantes_id: int
    estudiante_nombre: str
    parentesco: str | None = None
    
class LogroCatalogoOut(BaseModel):
    logros_id: int
    nombre: str
    descripcion: str | None = None


class OtorgarLogroRequest(BaseModel):
    logros_id: int
    
# ============================================================
# REGISTRO PÚBLICO (acudiente e instructor)
# ============================================================
class _RegistroBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    confirmar_password: str

    @field_validator("password")
    @classmethod
    def password_con_letras_y_numeros(cls, v: str) -> str:
        if not any(c.isalpha() for c in v) or not any(c.isdigit() for c in v):
            raise ValueError("La contraseña debe tener letras y números")
        return v

    @model_validator(mode="after")
    def passwords_coinciden(self):
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden")
        return self


class RegistroAcudienteRequest(_RegistroBase):
    telefono: Optional[str] = Field(None, max_length=30)
    parentesco: Optional[str] = Field(None, max_length=50)


class RegistroInstructorRequest(_RegistroBase):
    especialidad: Optional[str] = Field(None, max_length=100)
    codigo_invitacion: str = Field(..., min_length=1, max_length=100)


class RegistroOut(BaseModel):
    mensaje: str
    correo: str
    
class PendienteOut(BaseModel):
    usuarios_id: int
    nombre: str
    apellido: str
    correo: str
    telefono: str | None = None
    parentesco: str | None = None