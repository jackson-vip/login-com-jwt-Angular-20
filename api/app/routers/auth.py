from datetime import timedelta

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import login_user, logout_user, refresh_user_session, register_user


router = APIRouter(prefix="/auth", tags=["auth"])


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=refresh_token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=int(timedelta(days=settings.refresh_token_expire_days).total_seconds()),
        path=f"{settings.api_v1_str}/auth",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.refresh_token_cookie_name,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path=f"{settings.api_v1_str}/auth",
    )


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    token_response, refresh_token = login_user(db, payload)
    set_refresh_cookie(response, refresh_token)
    return token_response


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_token_cookie_name),
    db: Session = Depends(get_db),
) -> TokenResponse:
    if not refresh_token:
        clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token ausente")

    token_response, next_refresh_token = refresh_user_session(db, refresh_token)
    set_refresh_cookie(response, next_refresh_token)
    return token_response


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_token_cookie_name),
    db: Session = Depends(get_db),
) -> Response:
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    logout_user(db, refresh_token)
    clear_refresh_cookie(response)
    return response


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(username=current_user.username, email=current_user.email)
