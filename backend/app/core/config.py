from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://xama_user:xama_pass_2024@xama-db:5432/xama_db"
    redis_url: str = "redis://xama-cache:6379"
    secret_key: str = "dev"
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
