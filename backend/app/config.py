import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from dotenv import load_dotenv

# Explicitly load .env from current dir or backend dir
load_dotenv(".env")
load_dotenv("backend/.env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "CyberGuard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./cyberguard.db"

    # Groq LLM (primary AI engine)
    GROQ_API_KEY: str = ""

    # Legacy AI Keys (fallback support)
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # SSRF Protection Configuration
    BLOCKED_IP_RANGES: List[str] = [
        "127.0.0.0/8",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16",
        "169.254.0.0/16",
        "0.0.0.0/8",
        "::1/128",
        "fc00::/7",
        "fe80::/10"
    ]

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        extra="allow",
        case_sensitive=False
    )

settings = Settings()

# Ensure os.environ is updated if read via pydantic
if settings.GROQ_API_KEY and not os.getenv("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
