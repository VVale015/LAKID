# app/auth.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.security import get_current_user
from app.database import get_db
from app.models.usuario import Usuario
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(datos: schemas.LoginRequest, db: Session = Depends(get_db)):
    return auth_service.iniciar_sesion(db, datos.correo, datos.password)


@router.get("/me", response_model=schemas.UsuarioOut)
def perfil(usuario: Usuario = Depends(get_current_user)):
    return usuario