"""
JaundiCare — Database Session
Handles PostgreSQL connection via SQLAlchemy.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:jaundicare123@localhost:5432/jaundicare")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # reconnects if connection dropped
    pool_size=5,
    max_overflow=10,
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