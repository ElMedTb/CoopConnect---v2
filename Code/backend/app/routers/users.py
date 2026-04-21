from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_users():
    return {"msg": "Users router - WIP"}
