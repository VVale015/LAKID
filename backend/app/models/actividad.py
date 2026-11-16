from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Actividad(Base):
    __tablename__ = "actividades"

    actividades_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    modulos_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("modulos.modulos_id"))
    codigo: Mapped[str] = mapped_column(String(50), unique=True)
    titulo: Mapped[str] = mapped_column(String(150))
    descripcion: Mapped[str | None] = mapped_column(Text)
    instrucciones: Mapped[str | None] = mapped_column(Text)
    emoji: Mapped[str | None] = mapped_column(String(10))
    tipo: Mapped[str] = mapped_column(String(50))
    nivel_dificultad: Mapped[str] = mapped_column(String(30), default="BASICO")
    puntuacion_maxima: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=100)
    orden: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())