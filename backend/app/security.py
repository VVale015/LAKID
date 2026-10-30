# app/security.py
"""
Seguridad de LAKID:
  - Hash y verificación de contraseñas (bcrypt) -> columna usuarios.password_hash
  - Creación y validación de tokens JWT
  - Dependencias de FastAPI para obtener el usuario actual y exigir roles
    (ESTUDIANTE, ACUDIENTE, INSTRUCTOR)
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.rol import Rol
from app.models.usuario import Usuario

bearer_scheme = HTTPBearer()
bearer_scheme_opcional = HTTPBearer(auto_error=False)


# ------------------------------------------------------------
# Contraseñas
# ------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # Hash con formato inválido (por ejemplo, los hashes de ejemplo del script SQL)
        return False


# ------------------------------------------------------------
# JWT
# ------------------------------------------------------------
def create_access_token(usuarios_id: int, rol: str) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuarios_id),  # identificador del usuario
        "rol": rol,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ------------------------------------------------------------
# Dependencias de FastAPI
# ------------------------------------------------------------
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    payload = decode_jwt(credentials.credentials)

    sub = payload.get("sub")
    if sub is None or not str(sub).isdigit():
        raise HTTPException(status_code=401, detail="Token inválido: falta el usuario")

    usuario = db.get(Usuario, int(sub))
    if usuario is None or not usuario.status:
        raise HTTPException(status_code=401, detail="Usuario inexistente o inactivo")

    return usuario


def get_rol_nombre(db: Session, usuario: Usuario) -> str:
    rol = db.get(Rol, usuario.roles_id)
    return rol.nombre if rol else ""


def require_roles(*roles_permitidos: str):
    """
    Fábrica de dependencias. Uso en un router:

        @router.post("/", dependencies=[Depends(require_roles("INSTRUCTOR"))])
    o, si necesitas el usuario:
        usuario = Depends(require_roles("INSTRUCTOR", "ACUDIENTE"))
    """
    permitidos = {r.upper() for r in roles_permitidos}

    def dependencia(
        usuario: Usuario = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> Usuario:
        if get_rol_nombre(db, usuario).upper() not in permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para esta acción",
            )
        return usuario

    return dependencia


# Atajos por rol
get_current_estudiante = require_roles("ESTUDIANTE")
get_current_acudiente = require_roles("ACUDIENTE")
get_current_instructor = require_roles("INSTRUCTOR")


def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme_opcional),
    db: Session = Depends(get_db),
) -> Optional[Usuario]:
    """Devuelve el usuario si hay token válido; si no, None (sin error)."""
    if credentials is None:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None