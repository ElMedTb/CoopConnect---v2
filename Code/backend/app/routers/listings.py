from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def read_listings():
    return {"message": "Listings endpoint - Coming soon 🚀"}

@router.post("/")
async def create_listing():
    return {"message": "Create listing - WIP"}
