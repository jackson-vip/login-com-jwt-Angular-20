from datetime import datetime, timedelta, timezone
import hashlib

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"

# Médodo para verificar se a senha fornecida corresponde à senha armazenada (hash) no banco de dados.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Método para gerar o hash da senha fornecida, que será armazenado no banco de dados.
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Função para criar um token JWT com base no assunto (usuário), tipo de token e tempo de expiração.
def create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"sub": subject, "exp": expire, "type": token_type}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

# Função para criar um token de acesso JWT com base no assunto (usuário) e tempo de expiração.
def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    return create_token(
        subject=subject,
        token_type=ACCESS_TOKEN_TYPE,
        expires_delta=expires_delta or timedelta(minutes=settings.access_token_expire_minutes),
    )

# Função para criar um token de atualização JWT com base no assunto (usuário) e tempo de expiração.
def create_refresh_token(subject: str, expires_delta: timedelta | None = None) -> str:
    return create_token(
        subject=subject,
        token_type=REFRESH_TOKEN_TYPE,
        expires_delta=expires_delta or timedelta(days=settings.refresh_token_expire_days),
    )

# Função para obter a data de expiração do token de atualização, que é a data atual mais o tempo de expiração configurado.
def get_refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)

# Função para gerar o hash de um token, que é usado para armazenar o token de atualização de forma segura no banco de dados.
def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
