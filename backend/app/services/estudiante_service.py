from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import schemas
from app.models.estudiante import Estudiante
from app.models.modulo import Modulo
from app.models.progreso import Progreso
from app.models.usuario import Usuario
from app.models.logro import Logro
from app.models.estudiante_logro import EstudianteLogro

from decimal import Decimal

from app.models.actividad import Actividad
from app.models.asignacion import Asignacion
from app.models.intento import Intento


def calcular_edad(fecha_nacimiento: date) -> int:
    hoy = date.today()
    edad = hoy.year - fecha_nacimiento.year
    # Si todavía no ha cumplido años este año, se resta uno
    if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
        edad -= 1
    return edad


def _buscar_estudiante(db: Session, usuario: Usuario) -> Estudiante:
    """Devuelve el estudiante de la sesión, o 404 si no existe o está inactivo."""
    estudiante = db.scalar(
        select(Estudiante).where(Estudiante.usuarios_id == usuario.usuarios_id)
    )
    if estudiante is None or not estudiante.status:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return estudiante


def obtener_perfil(db: Session, usuario: Usuario) -> schemas.EstudianteOut:
    estudiante = _buscar_estudiante(db, usuario)

    return schemas.EstudianteOut(
        estudiantes_id=estudiante.estudiantes_id,
        nombre=usuario.nombre,
        apellido=usuario.apellido,
        avatar=estudiante.avatar,
        grado=estudiante.grado,
        edad=calcular_edad(estudiante.fecha_nacimiento),
    )


def obtener_progreso(db: Session, usuario: Usuario) -> schemas.ProgresoOut:
    estudiante = _buscar_estudiante(db, usuario)

    # Se parte de los módulos y se une el progreso del estudiante. Con
    # outerjoin, un módulo sin fila de progreso aparece igual, con 0.
    filas = db.execute(
        select(Modulo, Progreso)
        .outerjoin(
            Progreso,
            (Progreso.modulos_id == Modulo.modulos_id)
            & (Progreso.estudiantes_id == estudiante.estudiantes_id),
        )
        .where(Modulo.status.is_(True))
        .order_by(Modulo.orden)
    ).all()

    modulos = []
    for modulo, progreso in filas:
        modulos.append(
            schemas.ProgresoModuloOut(
                codigo=modulo.codigo,
                nombre=modulo.nombre,
                porcentaje=float(progreso.porcentaje) if progreso else 0.0,
                actividades_completadas=progreso.actividades_completadas if progreso else 0,
            )
        )

    # Regla de negocio: el progreso general es el promedio de los módulos
    promedio = sum(m.porcentaje for m in modulos) / len(modulos) if modulos else 0
    return schemas.ProgresoOut(
        progreso_general=int(promedio + 0.5),  # redondeo hacia arriba desde .5
        actividades_completadas=sum(m.actividades_completadas for m in modulos),
        modulos=modulos,
    )
    
def obtener_logros(db: Session, usuario: Usuario) -> list[schemas.LogroOut]:
    estudiante = _buscar_estudiante(db, usuario)

    # join: solo aparecen los logros que el estudiante ya tiene
    filas = db.execute(
        select(Logro, EstudianteLogro)
        .join(EstudianteLogro, EstudianteLogro.logros_id == Logro.logros_id)
        .where(EstudianteLogro.estudiantes_id == estudiante.estudiantes_id)
        .order_by(EstudianteLogro.fecha_obtencion)
    ).all()

    return [
        schemas.LogroOut(
            nombre=logro.nombre,
            descripcion=logro.descripcion,
            fecha_obtencion=asignado.fecha_obtencion,
        )
        for logro, asignado in filas
    ]
    
def registrar_resultado(
    db: Session, usuario: Usuario, datos: schemas.ResultadoRequest
) -> schemas.ResultadoOut:
    estudiante = _buscar_estudiante(db, usuario)

    actividad = db.scalar(
        select(Actividad).where(
            Actividad.codigo == datos.actividad_codigo,
            Actividad.status.is_(True),
        )
    )
    if actividad is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")

    try:
        # 1) Intento: el número sube cada vez que repite la misma actividad
        previos = db.scalar(
            select(func.count())
            .select_from(Intento)
            .where(
                Intento.estudiantes_id == estudiante.estudiantes_id,
                Intento.actividades_id == actividad.actividades_id,
            )
        )
        numero_intento = (previos or 0) + 1
        porcentaje = Decimal(str(datos.porcentaje))
        puntaje = (porcentaje / 100 * actividad.puntuacion_maxima).quantize(Decimal("0.01"))

        db.add(
            Intento(
                estudiantes_id=estudiante.estudiantes_id,
                actividades_id=actividad.actividades_id,
                numero_intento=numero_intento,
                puntaje=puntaje,
                porcentaje=porcentaje,
                estado="COMPLETADO",
                fecha_finalizacion=func.now(),
            )
        )

        # 2) Progreso del módulo: +10 (máximo 100), igual que la regla del front
        progreso = db.scalar(
            select(Progreso)
            .where(
                Progreso.estudiantes_id == estudiante.estudiantes_id,
                Progreso.modulos_id == actividad.modulos_id,
            )
            .with_for_update()
        )
        if progreso is None:
            progreso = Progreso(
                estudiantes_id=estudiante.estudiantes_id,
                modulos_id=actividad.modulos_id,
                actividades_completadas=0,
                actividades_totales=0,
                porcentaje=Decimal("0"),
            )
            db.add(progreso)
        progreso.porcentaje = min(Decimal("100"), progreso.porcentaje + 10)
        progreso.actividades_completadas += 1
        progreso.ultima_actividad = func.now()
        progreso.fecha_actualizacion = func.now()

        # 3) Asignación: se marca la pendiente más antigua de ese módulo
        asignacion = db.scalar(
            select(Asignacion)
            .join(Actividad, Actividad.actividades_id == Asignacion.actividades_id)
            .where(
                Asignacion.estudiantes_id == estudiante.estudiantes_id,
                Asignacion.fecha_completada.is_(None),
                Actividad.modulos_id == actividad.modulos_id,
            )
            .order_by(Asignacion.fecha_asignacion, Asignacion.asignaciones_id)
            .limit(1)
        )
        if asignacion is not None:
            asignacion.fecha_completada = func.now()

        # Las tres escrituras se confirman juntas o no se confirma ninguna
        db.commit()
    except Exception:
        db.rollback()
        raise

    return schemas.ResultadoOut(
        numero_intento=numero_intento,
        asignacion_completada=asignacion is not None,
        progreso=obtener_progreso(db, usuario),
    )