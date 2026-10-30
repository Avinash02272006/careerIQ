import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.role import Role
from app.db.models.skill import Skill

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("")
@router.get("/")
def get_all_roles(db: Session = Depends(get_db)):
    """
    Returns all benchmark industry roles with their required skills and market demand.
    """
    roles = db.query(Role).all()
    results = []
    for r in roles:
        results.append({
            "id": str(r.id),
            "title": r.title,
            "description": r.description,
            "required_skills": r.required_skills or [],
            "market_demand_index": float(r.market_demand_index) if r.market_demand_index is not None else 0.8,
        })
    return results


@router.get("/skills/catalog")
def get_all_skills(db: Session = Depends(get_db)):
    """
    Returns all available system skills by category for simulation and exploration.
    """
    skills = db.query(Skill).all()
    return [{"id": str(s.id), "name": s.name, "category": s.category} for s in skills]


@router.get("/{role_id}")
def get_role_details(role_id: uuid.UUID, db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return {
        "id": str(role.id),
        "title": role.title,
        "description": role.description,
        "required_skills": role.required_skills or [],
        "market_demand_index": float(role.market_demand_index) if role.market_demand_index is not None else 0.8,
    }
