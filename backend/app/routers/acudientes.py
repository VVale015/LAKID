from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models.usuario import Usuario
from app.security import require_roles
from app.services import acudiente_service

router = APIRouter(prefix="/acudientes", tags=["Acudientes"])


@router.get("/me/estudiantes", response_model=list[schemas.EstudianteOut])
def mis_estudiantes(
    usuario: Usuario = Depends(require_roles("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    return acudiente_service.listar_estudiantes(db, usuario)


@router.get(
    "/me/estudiantes/{estudiantes_id}/progreso",
    response_model=schemas.ProgresoOut,
)
def progreso_de_mi_estudiante(
    estudiantes_id: int,
    usuario: Usuario = Depends(require_roles("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    return acudiente_service.progreso_del_estudiante(db, usuario, estudiantes_id)


@router.get(
    "/me/estudiantes/{estudiantes_id}/logros",
    response_model=list[schemas.LogroOut],
)
def logros_de_mi_estudiante(
    estudiantes_id: int,
    usuario: Usuario = Depends(require_roles("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    return acudiente_service.logros_del_estudiante(db, usuario, estudiantes_id)
