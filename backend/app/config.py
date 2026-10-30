# app/config.py
"""
Configuración central de LAKID.
Todos los valores sensibles (URL de la BD, clave secreta) se leen desde
variables de entorno (archivo .env) y NUNCA se escriben en el código.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "LAKID API"
    APP_VERSION: str = "1.0.0"

    # Ej: postgresql+psycopg2://postgres:tu_clave@localhost:5432/lakid_db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Clave para firmar los JWT (generar una larga y aleatoria)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Orígenes permitidos para el frontend (separados por coma)
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]

    def __init__(self) -> None:
        if not self.DATABASE_URL:
            raise RuntimeError("Falta DATABASE_URL en el archivo .env")
        if not self.SECRET_KEY:
            raise RuntimeError("Falta SECRET_KEY en el archivo .env")


settings = Settings()