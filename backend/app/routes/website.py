import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Scan, Finding
from app.schemas import WebsiteCheckRequest, ScanResponse, FindingResponse
from app.services.website_checker import WebsiteChecker
from app.auth import get_current_user

router = APIRouter(prefix="/website", tags=["Website Security"])

@router.post("/check", response_model=ScanResponse)
async def check_website_security(
    req: WebsiteCheckRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="Target website URL is required.")

    try:
        result = await WebsiteChecker.inspect_website(req.url.strip())
    except PermissionError as pe:
        # SSRF blocked
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Website check failed: {str(e)}")

    hostname = result["metadata"]["hostname"]

    scan = Scan(
        user_id=current_user["uid"],
        module_type="website",
        target=f"https://{hostname}",
        overall_risk_score=result["overall_risk_score"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        metadata_json=json.dumps(result.get("metadata", {}))
    )
    db.add(scan)
    db.flush()

    for f in result["findings"]:
        finding = Finding(
            scan_id=scan.id,
            category=f.category,
            severity=f.severity,
            title=f.title,
            evidence=f.evidence,
            explanation=f.explanation,
            recommendation=f.recommendation,
            confidence=f.confidence,
            source=f.source,
            clause_or_check_type=f.clause_or_check_type
        )
        db.add(finding)

    db.commit()
    db.refresh(scan)

    return ScanResponse(
        id=scan.id,
        user_id=scan.user_id,
        module_type=scan.module_type,
        target=scan.target,
        overall_risk_score=scan.overall_risk_score,
        risk_level=scan.risk_level,
        summary=scan.summary,
        metadata=result.get("metadata", {}),
        findings=[FindingResponse.model_validate(f) for f in scan.findings],
        created_at=scan.created_at
    )
