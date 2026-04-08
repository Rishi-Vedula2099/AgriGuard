"""
AgriGuard Database Setup — SQLAlchemy async-compatible engine and session.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.exc import OperationalError
import logging

from config import get_settings

settings = get_settings()
logger = logging.getLogger("uvicorn.error")

def get_engine():
    """Create engine with automated fallback to SQLite."""
    primary_url = settings.DATABASE_URL
    # Logic for Postgres vs SQLite connect_args
    is_postgres = "postgresql" in primary_url
    
    # Base connect_args
    connect_args = {}
    if not is_postgres:
        connect_args = {"check_same_thread": False}

    try:
        # 1. Create the engine
        new_engine = create_engine(
            primary_url,
            connect_args=connect_args,
            echo=settings.DEBUG,
            # Add short pool timeout for fast failure during startup check
            pool_pre_ping=True
        )
        
        # 2. Test the connection
        if is_postgres:
            # We only do the pre-check for remote DBs like Postgres
            with new_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database connection established (Postgres)")
        
        return new_engine
        
    except (OperationalError, Exception) as e:
        if is_postgres:
            print(f"⚠️  WARNING: Failed to connect to Postgres at {primary_url}")
            print(f"   Error: {str(e).splitlines()[0]}")
            print(f"🔄 Falling back to local SQLite database: sqlite:///./agriguard.db")
            
            return create_engine(
                "sqlite:///./agriguard.db",
                connect_args={"check_same_thread": False},
                echo=settings.DEBUG
            )
        else:
            # If SQLite failed, something is very wrong, but let's re-raise or handle
            raise e

engine = get_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
