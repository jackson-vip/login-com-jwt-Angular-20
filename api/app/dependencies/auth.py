from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ACCESS_TOKEN_TYPE
from app.db.session import get_db
from app.models.user import User


# As dependencias do FastAPI são usadas para injetar automaticamente o token de autenticação e a sessão do banco de dados na função get_current_user. O token é decodificado usando a biblioteca jose, e se o token for válido, o usuário correspondente é recuperado do banco de dados. Se houver algum problema com o token ou se o usuário não for encontrado, uma exceção HTTP 401 é levantada.


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_str}/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nao foi possivel validar o token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != ACCESS_TOKEN_TYPE:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_exception
    return user
