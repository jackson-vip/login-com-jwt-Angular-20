from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User
from app.routers import auth
from app.services.auth_service import seed_default_user

# No arquivo main.py no angular, serve para iniciar a aplicação FastAPI, configurar o CORS, 
# incluir os roteadores e definir o ponto de entrada da API. O código cria a tabela do banco de dados, 
# insere um usuário padrão e define os endpoints da API, incluindo autenticação e verificação de saúde.

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine) 
    db = SessionLocal()
    try:
        seed_default_user(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_v1_str)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "FastAPI auth backend running"}
