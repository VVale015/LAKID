from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import schemas
from app.models.acudiente import Acudiente
from app.models.acudiente_estudiante import AcudienteEstudiante
from app.models.estudiante import Estudiante
from app.models.usuario import Usuario
from app.services import estudiante_service


def _buscar_acudiente(db: Session, usuario: Usuario) -> Acudiente:
    acudiente = db.scalar(
        select(Acudiente).where(Acudiente.usuarios_id == usuario.usuarios_id)
    )
    if acudiente is None or not acudiente.status:
        raise HTTPException(status_code=404, detail="Acudiente no encontrado")
    return acudiente


def _usuario_del_estudiante(db: Session, usuario: Usuario, estudiantes_id: int) -> Usuario:
    """Devuelve el usuario del niño SOLO si está vinculado a este acudiente."""
    acudiente = _buscar_acudiente(db, usuario)

    vinculo = db.scalar(
        select(AcudienteEstudiante).where(
            AcudienteEstudiante.acudientes_id == acudiente.acudientes_id,
            AcudienteEstudiante.estudiantes_id == estudiantes_id,
            AcudienteEstudiante.status.is_(True),
        )
    )
    if vinculo is None:
        raise HTTPException(
            status_code=403, detail="Ese estudiante no está vinculado a tu cuenta"
        )

    estudiante = db.get(Estudiante, estudiantes_id)
    if estudiante is None or not estudiante.status:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    usuario_nino = db.get(Usuario, estudiante.usuarios_id)
    if usuario_nino is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return usuario_nino


def listar_estudiantes(db: Session, usuario: Usuario) -> list[schemas.EstudianteOut]:
    acudiente = _buscar_acudiente(db, usuario)
    ids = db.scalars(
        select(AcudienteEstudiante.estudiantes_id)
        .where(
            AcudienteEstudiante.acudientes_id == acudiente.acudientes_id,
            AcudienteEstudiante.status.is_(True),
        )
        .order_by(AcudienteEstudiante.estudiantes_id)
    ).all()

    resultado = []
    for estudiantes_id in ids:
        try:
            usuario_nino = _usuario_del_estudiante(db, usuario, estudiantes_id)
        except HTTPException:
            continue  # si un niño está inactivo, simplemente no se lista
        resultado.append(estudiante_service.obtener_perfil(db, usuario_nino))
    return resultado


def progreso_del_estudiante(
    db: Session, usuario: Usuario, estudiantes_id: int
) -> schemas.ProgresoOut:
    usuario_nino = _usuario_del_estudiante(db, usuario, estudiantes_id)
    return estudiante_service.obtener_progreso(db, usuario_nino)


def logros_del_estudiante(
    db: Session, usuario: Usuario, estudiantes_id: int
) -> list[schemas.LogroOut]:
    usuario_nino = _usuario_del_estudiante(db, usuario, estudiantes_id)
    return estudiante_service.obtener_logros(db, usuario_nino)