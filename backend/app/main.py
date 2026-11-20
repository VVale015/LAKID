# app/main.py
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.routers import auth, estudiantes, acudientes, instructores

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS: permite que el front (React) le hable a este back-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(estudiantes.router)
app.include_router(acudientes.router)
app.include_router(instructores.router)
@app.get("/ping")
def ping():
    """Prueba de vida: no usa la base de datos."""
    return {"estado": "ok", "mensaje": "El back-end de LAKID está vivo"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Revisa que la base de datos responda."""
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        print("ERROR DE BD:", repr(e))
        raise HTTPException(status_code=503, detail="Base de datos no disponible")
    return {"status": "healthy", "database": "connected"}