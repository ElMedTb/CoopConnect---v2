from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, verify_token
from app.crud.user import create_user, authenticate_user
from app.schemas.user import UserCreate, UserLogin, Token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=Token)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    # Check if exists
    if create_user(db, user_create).id:
        access_token = create_access_token(data={"sub": user_create.email})
        return {"access_token": access_token}
    raise HTTPException(status_code=400, detail="User already exists")

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token}

@router.post("/verify-token")
async def verify(token: str = Depends(oauth2_scheme)):
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"email": data.email}
