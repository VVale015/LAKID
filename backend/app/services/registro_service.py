import secrets

from app.config import settings

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import schemas
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.models.acudiente import Acudiente
from app.models.instructor import Instructor
from app.security import hash_password


def registrar_acudiente(
    db: Session, datos: schemas.RegistroAcudienteRequest
) -> schemas.RegistroOut:
    correo = datos.correo.strip().lower()

    # El rol lo decide el servidor: el cliente nunca puede elegirlo
    rol = db.scalar(
        select(Rol).where(func.upper(Rol.nombre) == "ACUDIENTE", Rol.status.is_(True))
    )
    if rol is None:
        raise HTTPException(status_code=500, detail="Configuración de roles incompleta")

    existe = db.scalar(select(Usuario).where(func.lower(Usuario.correo) == correo))
    if existe is not None:
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado")

    try:
        usuario = Usuario(
            roles_id=rol.roles_id,
            nombre=datos.nombre.strip(),
            apellido=datos.apellido.strip(),
            correo=correo,
            password_hash=hash_password(datos.password),
            status=False,  # pendiente: el instructor debe aprobarla
        )
        db.add(usuario)
        db.flush()  # para obtener usuarios_id antes de confirmar

        db.add(
            Acudiente(
                usuarios_id=usuario.usuarios_id,
                telefono=datos.telefono,
                parentesco=datos.parentesco,
            )
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado")
    except Exception:
        db.rollback()
        raise

    return schemas.RegistroOut(
        mensaje="Registro recibido. Un instructor debe aprobar tu cuenta antes de ingresar.",
        correo=correo,
    )
    
def registrar_instructor(
    db: Session, datos: schemas.RegistroInstructorRequest
) -> schemas.RegistroOut:
    codigo_correcto = settings.INVITACION_INSTRUCTOR

    # Si el código no está configurado, este registro queda cerrado
    if not codigo_correcto:
        raise HTTPException(
            status_code=403, detail="El registro de instructores no está habilitado"
        )

    # El código se revisa ANTES que el correo: sin código válido nadie averigua
    # qué correos ya existen. compare_digest evita ataques por tiempo de respuesta.
    if not secrets.compare_digest(
        datos.codigo_invitacion.encode("utf-8"), codigo_correcto.encode("utf-8")
    ):
        raise HTTPException(status_code=403, detail="Código de invitación inválido")

    correo = datos.correo.strip().lower()

    rol = db.scalar(
        select(Rol).where(func.upper(Rol.nombre) == "INSTRUCTOR", Rol.status.is_(True))
    )
    if rol is None:
        raise HTTPException(status_code=500, detail="Configuración de roles incompleta")

    existe = db.scalar(select(Usuario).where(func.lower(Usuario.correo) == correo))
    if existe is not None:
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado")

    try:
        usuario = Usuario(
            roles_id=rol.roles_id,
            nombre=datos.nombre.strip(),
            apellido=datos.apellido.strip(),
            correo=correo,
            password_hash=hash_password(datos.password),
            status=True,  # la invitación ya es el control de acceso
        )
        db.add(usuario)
        db.flush()

        db.add(
            Instructor(
                usuarios_id=usuario.usuarios_id,
                especialidad=datos.especialidad,
            )
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Ese correo ya está registrado")
    except Exception:
        db.rollback()
        raise

    return schemas.RegistroOut(
        mensaje="Registro exitoso. Ya puedes iniciar sesión.",
        correo=correo,
    )