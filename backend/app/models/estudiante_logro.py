from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EstudianteLogro(Base):
    __tablename__ = "estudiante_logros"

    estudiantes_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("estudiantes.estudiantes_id"), primary_key=True
    )
    logros_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("logros.logros_id"), primary_key=True
    )
    fecha_obtencion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())