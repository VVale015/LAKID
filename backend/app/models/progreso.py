from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Progreso(Base):
    __tablename__ = "progreso"

    progreso_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    estudiantes_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("estudiantes.estudiantes_id")
    )
    modulos_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("modulos.modulos_id"))
    actividades_completadas: Mapped[int] = mapped_column(Integer, default=0)
    actividades_totales: Mapped[int] = mapped_column(Integer, default=0)
    porcentaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    ultima_actividad: Mapped[datetime | None] = mapped_column(DateTime)
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())