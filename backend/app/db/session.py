"""
JaundiCare — Database Session
Handles PostgreSQL connection via SQLAlchemy.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

def _normalise_database_url(value: str | None) -> str:
    """Normalise common PostgreSQL URL forms before SQLAlchemy uses them.

    Supabase provides a standard ``postgresql://`` URL, but accepting the
    legacy ``postgres://`` form makes a provider switch less error-prone.
    TLS is configured in the URL itself (``?sslmode=require``) so no database
    credentials or provider-specific settings are hard-coded here.
    """

    if not value:
        raise RuntimeError("DATABASE_URL must be configured before the API can start.")

    database_url = value.strip()
    if database_url.startswith("postgres://"):
        return "postgresql://" + database_url.removeprefix("postgres://")
    return database_url


DATABASE_URL = _normalise_database_url(os.getenv("DATABASE_URL"))

# Keep the application pool deliberately small. When Render connects to a
# Supabase Free project it should use Supavisor's *session* pooler, which is
# intended for persistent app servers on IPv4-only hosts.
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "3"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "2"))

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # reconnects if connection dropped
    pool_size=DB_POOL_SIZE,
    max_overflow=DB_MAX_OVERFLOW,
    pool_timeout=30,
    pool_recycle=300,
    connect_args={"connect_timeout": 10},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables():
    """Create all tables if they do not exist. Called on startup."""
    from app.db import models  # noqa: F401 — import so models are registered
    Base.metadata.create_all(bind=engine)
    print("Database tables ready.")
