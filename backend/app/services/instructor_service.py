from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, aliased

from app import schemas
from app.models.acudiente import Acudiente
from app.models.acudiente_estudiante import AcudienteEstudiante
from app.models.estudiante import Estudiante
from app.models.usuario import Usuario
from app.models.logro import Logro
from app.models.estudiante_logro import EstudianteLogro
from app.services.estudiante_service import calcular_edad


def listar_estudiantes(db: Session) -> list[schemas.EstudianteListaOut]:
    filas = db.execute(
        select(Estudiante, Usuario)
        .join(Usuario, Usuario.usuarios_id == Estudiante.usuarios_id)
        .where(Estudiante.status.is_(True))
        .order_by(Estudiante.estudiantes_id)
    ).all()
    return [
        schemas.EstudianteListaOut(
            estudiantes_id=e.estudiantes_id,
            nombre=u.nombre,
            apellido=u.apellido,
            avatar=e.avatar,
            grado=e.grado,
            edad=calcular_edad(e.fecha_nacimiento),
        )
        for e, u in filas
    ]


def listar_acudientes(db: Session) -> list[schemas.AcudienteListaOut]:
    filas = db.execute(
        select(Acudiente, Usuario)
        .join(Usuario, Usuario.usuarios_id == Acudiente.usuarios_id)
        .where(Acudiente.status.is_(True), Usuario.status.is_(True))
        .order_by(Acudiente.acudientes_id)
    ).all()
    return [
        schemas.AcudienteListaOut(
            acudientes_id=a.acudientes_id,
            nombre=u.nombre,
            apellido=u.apellido,
            correo=u.correo,
        )
        for a, u in filas
    ]


def listar_vinculos(
    db: Session, vinculo_id: int | None = None
) -> list[schemas.VinculoOut]:
    ua = aliased(Usuario)  # usuario del acudiente
    ue = aliased(Usuario)  # usuario del estudiante
    consulta = (
        select(AcudienteEstudiante, ua, ue)
        .join(Acudiente, Acudiente.acudientes_id == AcudienteEstudiante.acudientes_id)
        .join(ua, ua.usuarios_id == Acudiente.usuarios_id)
        .join(Estudiante, Estudiante.estudiantes_id == AcudienteEstudiante.estudiantes_id)
        .join(ue, ue.usuarios_id == Estudiante.usuarios_id)
        .where(AcudienteEstudiante.status.is_(True))
        .order_by(AcudienteEstudiante.acudiente_estudiante_id)
    )
    if vinculo_id is not None:
        consulta = consulta.where(
            AcudienteEstudiante.acudiente_estudiante_id == vinculo_id
        )
    return [
        schemas.VinculoOut(
            acudiente_estudiante_id=v.acudiente_estudiante_id,
            acudientes_id=v.acudientes_id,
            acudiente_nombre=f"{a.nombre} {a.apellido}",
            estudiantes_id=v.estudiantes_id,
            estudiante_nombre=f"{e.nombre} {e.apellido}",
            parentesco=v.parentesco,
        )
        for v, a, e in db.execute(consulta).all()
    ]


def vincular(db: Session, datos: schemas.VinculoRequest) -> schemas.VinculoOut:
    acudiente = db.get(Acudiente, datos.acudientes_id)
    if acudiente is None or not acudiente.status:
        raise HTTPException(status_code=404, detail="Acudiente no encontrado")

    estudiante = db.get(Estudiante, datos.estudiantes_id)
    if estudiante is None or not estudiante.status:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    vinculo = db.scalar(
        select(AcudienteEstudiante).where(
            AcudienteEstudiante.acudientes_id == datos.acudientes_id,
            AcudienteEstudiante.estudiantes_id == datos.estudiantes_id,
        )
    )
    if vinculo is not None and vinculo.status:
        raise HTTPException(status_code=409, detail="Ese vínculo ya existe")

    try:
        if vinculo is None:
            vinculo = AcudienteEstudiante(
                acudientes_id=datos.acudientes_id,
                estudiantes_id=datos.estudiantes_id,
                parentesco=datos.parentesco,
            )
            db.add(vinculo)
        else:
            # existía pero estaba desactivado: se reactiva (la tabla es UNIQUE)
            vinculo.status = True
            vinculo.parentesco = datos.parentesco
        db.commit()
    except Exception:
        db.rollback()
        raise

    return listar_vinculos(db, vinculo.acudiente_estudiante_id)[0]


def desvincular(db: Session, vinculo_id: int) -> None:
    vinculo = db.get(AcudienteEstudiante, vinculo_id)
    if vinculo is None or not vinculo.status:
        raise HTTPException(status_code=404, detail="Vínculo no encontrado")
    try:
        vinculo.status = False
        db.commit()
    except Exception:
        db.rollback()
        raise
    
def listar_catalogo_logros(db: Session) -> list[schemas.LogroCatalogoOut]:
    logros = db.scalars(select(Logro).order_by(Logro.logros_id)).all()
    return [
        schemas.LogroCatalogoOut(
            logros_id=l.logros_id, nombre=l.nombre, descripcion=l.descripcion
        )
        for l in logros
    ]


def listar_logros_de_estudiante(
    db: Session, estudiantes_id: int
) -> list[schemas.LogroOut]:
    estudiante = db.get(Estudiante, estudiantes_id)
    if estudiante is None or not estudiante.status:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    filas = db.execute(
        select(Logro, EstudianteLogro)
        .join(EstudianteLogro, EstudianteLogro.logros_id == Logro.logros_id)
        .where(EstudianteLogro.estudiantes_id == estudiantes_id)
        .order_by(EstudianteLogro.fecha_obtencion)
    ).all()
    return [
        schemas.LogroOut(
            nombre=l.nombre,
            descripcion=l.descripcion,
            fecha_obtencion=a.fecha_obtencion,
        )
        for l, a in filas
    ]


def otorgar_logro(
    db: Session, estudiantes_id: int, logros_id: int
) -> schemas.LogroOut:
    estudiante = db.get(Estudiante, estudiantes_id)
    if estudiante is None or not estudiante.status:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    logro = db.get(Logro, logros_id)
    if logro is None:
        raise HTTPException(status_code=404, detail="Insignia no encontrada")

    ya_lo_tiene = db.scalar(
        select(EstudianteLogro).where(
            EstudianteLogro.estudiantes_id == estudiantes_id,
            EstudianteLogro.logros_id == logros_id,
        )
    )
    if ya_lo_tiene is not None:
        raise HTTPException(
            status_code=409, detail="El estudiante ya tiene esa insignia"
        )

    try:
        asignado = EstudianteLogro(
            estudiantes_id=estudiantes_id,
            logros_id=logros_id,
            fecha_obtencion=func.now(),
        )
        db.add(asignado)
        db.commit()
        db.refresh(asignado)
    except Exception:
        db.rollback()
        raise

    return schemas.LogroOut(
        nombre=logro.nombre,
        descripcion=logro.descripcion,
        fecha_obtencion=asignado.fecha_obtencion,
    )
    
def listar_pendientes(db: Session) -> list[schemas.PendienteOut]:
    filas = db.execute(
        select(Acudiente, Usuario)
        .join(Usuario, Usuario.usuarios_id == Acudiente.usuarios_id)
        .where(Usuario.status.is_(False), Acudiente.status.is_(True))
        .order_by(Usuario.usuarios_id)
    ).all()
    return [
        schemas.PendienteOut(
            usuarios_id=u.usuarios_id,
            nombre=u.nombre,
            apellido=u.apellido,
            correo=u.correo,
            telefono=a.telefono,
            parentesco=a.parentesco,
        )
        for a, u in filas
    ]


def _buscar_pendiente(db: Session, usuarios_id: int):
    fila = db.execute(
        select(Acudiente, Usuario)
        .join(Usuario, Usuario.usuarios_id == Acudiente.usuarios_id)
        .where(
            Usuario.usuarios_id == usuarios_id,
            Usuario.status.is_(False),
            Acudiente.status.is_(True),
        )
    ).first()
    if fila is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return fila


def aprobar_acudiente(db: Session, usuarios_id: int) -> None:
    _, usuario = _buscar_pendiente(db, usuarios_id)
    try:
        usuario.status = True
        db.commit()
    except Exception:
        db.rollback()
        raise


def rechazar_acudiente(db: Session, usuarios_id: int) -> None:
    acudiente, usuario = _buscar_pendiente(db, usuarios_id)
    # Se elimina: así no quedan datos personales de alguien que no fue aceptado
    try:
        db.delete(acudiente)
        db.flush()
        db.delete(usuario)
        db.commit()
    except Exception:
        db.rollback()
        raise