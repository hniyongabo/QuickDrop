import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env


def required(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Missing env var {key}")
    return value


config = {
    "port": int(os.getenv("PORT", 3000)),

    "jwtSecret": required("JWT_SECRET"),
    "jwtExpiresIn": os.getenv("JWT_EXPIRES_IN", "1h"),

    "bcryptSaltRounds": int(os.getenv("BCRYPT_SALT_ROUNDS", 12)),

    "rateLimitWindowMs": int(os.getenv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000)),
    "rateLimitMax": int(os.getenv("RATE_LIMIT_MAX", 100)),

    "corsOrigins": [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ],
}
