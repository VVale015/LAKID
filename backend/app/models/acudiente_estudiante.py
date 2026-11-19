from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AcudienteEstudiante(Base):
    __tablename__ = "acudiente_estudiante"

    acudiente_estudiante_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    acudientes_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("acudientes.acudientes_id")
    )
    estudiantes_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("estudiantes.estudiantes_id")
    )
    parentesco: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_asociacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())