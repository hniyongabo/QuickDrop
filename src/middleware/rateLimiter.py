from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{config['rateLimitMax']} per {config['rateLimitWindowMs']/1000} seconds"],
    standard_headers=True,
    legacy_headers=False
)

