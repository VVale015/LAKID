from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Instructor(Base):
    __tablename__ = "instructores"

    instructores_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuarios_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.usuarios_id"), unique=True
    )
    especialidad: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())