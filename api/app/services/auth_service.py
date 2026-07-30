from datetime import datetime, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_refresh_token_expiry,
    hash_token,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


def seed_default_user(db: Session) -> None:
    existing_user = db.query(User).filter(User.email == "admin@example.com").first()
    if existing_user:
        return

    db.add(
        User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("123456"),
        )
    )
    db.commit()


def register_user(db: Session, payload: RegisterRequest) -> UserResponse:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario ja cadastrado",
        )

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(username=user.username, email=user.email)


def build_auth_response(user: User) -> tuple[TokenResponse, str]:
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)
    user.refresh_token_hash = hash_token(refresh_token)
    user.refresh_token_expires_at = get_refresh_token_expiry()
    db_refresh_user = user
    return (
        TokenResponse(
            access_token=access_token,
            user={"username": db_refresh_user.username, "email": db_refresh_user.email},
        ),
        refresh_token,
    )


def login_user(db: Session, payload: LoginRequest) -> tuple[TokenResponse, str]:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais invalidas",
        )

    token_response, refresh_token = build_auth_response(user)
    db.add(user)
    db.commit()
    return token_response, refresh_token


def refresh_user_session(db: Session, refresh_token: str) -> tuple[TokenResponse, str]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token invalido",
    )

    try:
        payload = jwt.decode(refresh_token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != REFRESH_TOKEN_TYPE:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(User).filter(User.email == email).first()
    if not user or user.refresh_token_hash != hash_token(refresh_token):
        raise credentials_exception

    expires_at = user.refresh_token_expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if not expires_at or expires_at <= datetime.now(timezone.utc):
        user.refresh_token_hash = None
        user.refresh_token_expires_at = None
        db.add(user)
        db.commit()
        raise credentials_exception

    token_response, next_refresh_token = build_auth_response(user)
    db.add(user)
    db.commit()
    return token_response, next_refresh_token


def logout_user(db: Session, refresh_token: str | None) -> None:
    if not refresh_token:
        return

    try:
        payload = jwt.decode(refresh_token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
    except JWTError:
        return

    if not email:
        return

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return

    user.refresh_token_hash = None
    user.refresh_token_expires_at = None
    db.add(user)
    db.commit()
