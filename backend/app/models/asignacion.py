from datetime import date, datetime

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Asignacion(Base):
    __tablename__ = "asignaciones"

    asignaciones_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    # Sin ForeignKey aquí: todavía no existe el modelo Instructor. La base de
    # datos sí exige la llave foránea; esto solo evita un error de SQLAlchemy.
    instructores_id: Mapped[int] = mapped_column(BigInteger)
    estudiantes_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("estudiantes.estudiantes_id")
    )
    actividades_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("actividades.actividades_id")
    )
    fecha_limite: Mapped[date | None] = mapped_column(Date)
    fecha_asignacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_completada: Mapped[datetime | None] = mapped_column(DateTime)