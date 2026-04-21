from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_matches():
    return {"message": "AI Matching - Powered by scikit-learn 🤖"}

@router.get("/my-matches")
async def get_user_matches():
    return {"matches": []}
