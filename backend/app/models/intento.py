from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Intento(Base):
    __tablename__ = "intentos"

    intentos_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    estudiantes_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("estudiantes.estudiantes_id")
    )
    actividades_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("actividades.actividades_id")
    )
    numero_intento: Mapped[int] = mapped_column(Integer, default=1)
    puntaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    porcentaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    estado: Mapped[str] = mapped_column(String(30), default="INICIADO")
    fecha_inicio: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_finalizacion: Mapped[datetime | None] = mapped_column(DateTime)