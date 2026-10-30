from datetime import date, datetime

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Estudiante(Base):
    __tablename__ = "estudiantes"

    estudiantes_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuarios_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.usuarios_id"), unique=True
    )
    fecha_nacimiento: Mapped[date] = mapped_column(Date)
    grado: Mapped[str | None] = mapped_column(String(50))
    avatar: Mapped[str] = mapped_column(String(10), default="🙂")
    observaciones: Mapped[str | None] = mapped_column(Text)
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())