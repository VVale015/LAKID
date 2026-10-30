# app/auth_service.py
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.security import create_access_token, get_rol_nombre, verify_password
from app.models.usuario import Usuario


def autenticar_usuario(db: Session, correo: str, password: str) -> Optional[Usuario]:
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if usuario is None or not usuario.status:
        return None
    if not verify_password(password, usuario.password_hash):
        return None
    return usuario


def iniciar_sesion(db: Session, correo: str, password: str) -> dict:
    usuario = autenticar_usuario(db, correo, password)
    if usuario is None:
        # Mensaje genérico: no revela si falló el correo o la contraseña
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    rol = get_rol_nombre(db, usuario)
    token = create_access_token(usuario.usuarios_id, rol)
    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": rol,
        "usuario": usuario,
    }