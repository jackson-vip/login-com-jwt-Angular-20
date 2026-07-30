from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Auth API"
    api_v1_str: str = "/api/v1"
    secret_key: str = "change-this-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    refresh_token_cookie_name: str = "refresh_token"
    secure_cookies: bool = False
    allowed_origins: list[str] = ["http://localhost:4200"]
    database_url: str = "sqlite:///./auth.db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
