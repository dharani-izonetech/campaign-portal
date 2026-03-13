from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# ─── Connection ────────────────────────────────────────────────────────────────
# Full URL takes precedence when provided.
# Otherwise, build from individual parts (useful for docker-compose / VPS env).
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DB_HOST     = os.getenv("DB_HOST",     "localhost")
    DB_PORT     = os.getenv("DB_PORT",     "5432")
    DB_NAME     = os.getenv("DB_NAME",     "campaign_db")
    DB_USER     = os.getenv("DB_USER",     "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# ─── Schema ────────────────────────────────────────────────────────────────────
# All tables will be created under this PostgreSQL schema.
DB_SCHEMA = os.getenv("DB_SCHEMA", "campaign_tweet")

# ─── Engine ────────────────────────────────────────────────────────────────────
connect_args = {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,         # detect stale connections (important for remote DBs)
    pool_recycle=1800,          # recycle connections every 30 min
    pool_size=5,
    max_overflow=10,
)

# Set search_path to the target schema on every new connection
@event.listens_for(engine, "connect")
def set_search_path(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute(f"SET search_path TO {DB_SCHEMA}, public")
    cursor.close()

# ─── Session / Base ────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pass schema so all models use it in __table_args__
Base = declarative_base()
Base.metadata.schema = DB_SCHEMA


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create the schema (if missing) then all tables."""
    with engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
