from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models.usuario import Usuario
from app.security import require_roles
from app.services import estudiante_service

router = APIRouter(prefix="/estudiantes", tags=["Estudiantes"])


@router.get("/me", response_model=schemas.EstudianteOut)
def mi_perfil(
    usuario: Usuario = Depends(require_roles("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    return estudiante_service.obtener_perfil(db, usuario)
@router.get("/me/progreso", response_model=schemas.ProgresoOut)
def mi_progreso(
    usuario: Usuario = Depends(require_roles("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    return estudiante_service.obtener_progreso(db, usuario)

@router.get("/me/logros", response_model=list[schemas.LogroOut])
def mis_logros(
    usuario: Usuario = Depends(require_roles("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    return estudiante_service.obtener_logros(db, usuario)