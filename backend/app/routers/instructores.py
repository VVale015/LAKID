from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.security import require_roles
from app.services import instructor_service

# Todo el router exige rol INSTRUCTOR: un endpoint nuevo no puede quedar abierto por olvido
router = APIRouter(
    prefix="/instructores",
    tags=["Instructores"],
    dependencies=[Depends(require_roles("INSTRUCTOR"))],
)


@router.get("/estudiantes", response_model=list[schemas.EstudianteListaOut])
def estudiantes(db: Session = Depends(get_db)):
    return instructor_service.listar_estudiantes(db)


@router.get("/acudientes", response_model=list[schemas.AcudienteListaOut])
def acudientes(db: Session = Depends(get_db)):
    return instructor_service.listar_acudientes(db)


@router.get("/vinculos", response_model=list[schemas.VinculoOut])
def vinculos(db: Session = Depends(get_db)):
    return instructor_service.listar_vinculos(db)


@router.post("/vinculos", response_model=schemas.VinculoOut, status_code=201)
def crear_vinculo(datos: schemas.VinculoRequest, db: Session = Depends(get_db)):
    return instructor_service.vincular(db, datos)


@router.delete("/vinculos/{vinculo_id}", status_code=204)
def quitar_vinculo(vinculo_id: int, db: Session = Depends(get_db)):
    instructor_service.desvincular(db, vinculo_id)
    
@router.get("/logros", response_model=list[schemas.LogroCatalogoOut])
def catalogo_logros(db: Session = Depends(get_db)):
    return instructor_service.listar_catalogo_logros(db)


@router.get(
    "/estudiantes/{estudiantes_id}/logros", response_model=list[schemas.LogroOut]
)
def logros_de_estudiante(estudiantes_id: int, db: Session = Depends(get_db)):
    return instructor_service.listar_logros_de_estudiante(db, estudiantes_id)


@router.post(
    "/estudiantes/{estudiantes_id}/logros",
    response_model=schemas.LogroOut,
    status_code=201,
)
def dar_logro(
    estudiantes_id: int,
    datos: schemas.OtorgarLogroRequest,
    db: Session = Depends(get_db),
):
    return instructor_service.otorgar_logro(db, estudiantes_id, datos.logros_id)

@router.get("/pendientes", response_model=list[schemas.PendienteOut])
def pendientes(db: Session = Depends(get_db)):
    return instructor_service.listar_pendientes(db)


@router.post("/pendientes/{usuarios_id}/aprobar", status_code=204)
def aprobar(usuarios_id: int, db: Session = Depends(get_db)):
    instructor_service.aprobar_acudiente(db, usuarios_id)


@router.post("/pendientes/{usuarios_id}/rechazar", status_code=204)
def rechazar(usuarios_id: int, db: Session = Depends(get_db)):
    instructor_service.rechazar_acudiente(db, usuarios_id)