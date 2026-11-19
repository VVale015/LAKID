from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Acudiente(Base):
    __tablename__ = "acudientes"

    acudientes_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuarios_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("usuarios.usuarios_id"), unique=True
    )
    telefono: Mapped[str | None] = mapped_column(String(30))
    parentesco: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_actualizacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    