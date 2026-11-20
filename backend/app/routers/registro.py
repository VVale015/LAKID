from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.services import registro_service

router = APIRouter(prefix="/registro", tags=["Registro"])


@router.post("/acudiente", response_model=schemas.RegistroOut, status_code=201)
def registrar_acudiente(
    datos: schemas.RegistroAcudienteRequest, db: Session = Depends(get_db)
):
    return registro_service.registrar_acudiente(db, datos)

@router.post("/instructor", response_model=schemas.RegistroOut, status_code=201)
def registrar_instructor(
    datos: schemas.RegistroInstructorRequest, db: Session = Depends(get_db)
):
    return registro_service.registrar_instructor(db, datos)