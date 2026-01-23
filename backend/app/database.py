from sqlalchemy import create_engine, inspect as sqlalchemy_inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Handles schema updates for existing databases.
    """
    from app.models import User
    
    try:
        inspector = sqlalchemy_inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if 'users' in existing_tables:
            # Check if google_id column exists
            columns = [col['name'] for col in inspector.get_columns('users')]
            if 'google_id' not in columns:
                # Add missing columns using ALTER TABLE
                print("Updating database schema...")
                try:
                    from sqlalchemy import text
                    with engine.connect() as conn:
                        conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
                        conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)"))
                        conn.commit()
                    # Try to create index (may fail if it exists)
                    try:
                        from sqlalchemy import text
                        with engine.connect() as conn:
                            conn.execute(text("CREATE INDEX ix_users_google_id ON users(google_id)"))
                            conn.commit()
                    except:
                        pass  # Index might already exist
                    print("Database schema updated with Google OAuth fields")
                except Exception as e:
                    print(f"Error updating schema: {e}")
                    print("Dropping and recreating tables...")
                    Base.metadata.drop_all(bind=engine)
                    Base.metadata.create_all(bind=engine)
                    print("Database recreated with updated schema")
            else:
                print("Database schema is up to date")
        else:
            # Create all tables if they don't exist
            Base.metadata.create_all(bind=engine)
            print("Database initialized")
    except Exception as e:
        print(f"Error checking database schema: {e}")
        # Fallback: create all tables
        Base.metadata.create_all(bind=engine)
        print("Database initialized (fallback)")
