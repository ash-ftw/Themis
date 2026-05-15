from fastapi import APIRouter

from app.api.v1 import assessments, auth, complaints, health, legal

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(health.router, tags=["health"])
api_router.include_router(legal.router)
api_router.include_router(legal.admin_router)
api_router.include_router(assessments.router)
api_router.include_router(complaints.router)
