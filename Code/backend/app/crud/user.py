from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.security import get_password_hash, verify_password
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    return db.query(User).filter(User.phone == phone).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_user(db: Session, user_create: UserCreate) -> User:
    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        phone=user_create.phone,
        hashed_password=hashed_password,
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise ValueError("Email or phone already registered")
