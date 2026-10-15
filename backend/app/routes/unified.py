import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Scan, Finding, ComplianceItem
from app.schemas import UnifiedRiskRequest, ScanResponse, FindingResponse, ComplianceItemResponse
from app.services.unified_risk import UnifiedRiskEngine
from app.auth import get_current_user

router = APIRouter(prefix="/unified", tags=["Unified Risk Dashboard"])

@router.post("/audit", response_model=ScanResponse)
async def run_unified_audit(
    req: UnifiedRiskRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not any([req.url, req.policy_text, req.email_text]):
        raise HTTPException(status_code=400, detail="Provide at least one input: website URL, policy text, or email text.")

    target_desc = req.title or (req.url or "Multi-Vector Digital Audit")

    result = await UnifiedRiskEngine.run_unified_audit(
        url=req.url,
        policy_text=req.policy_text,
        email_text=req.email_text,
        user_api_key=req.user_api_key
    )

    scan = Scan(
        user_id=current_user["uid"],
        module_type="unified",
        target=target_desc,
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

    for ci_item in result.get("compliance_items", []):
        ci = ComplianceItem(
            scan_id=scan.id,
            framework=ci_item.framework,
            requirement_id=ci_item.requirement_id,
            requirement_title=ci_item.requirement_title,
            status=ci_item.status,
            citation=ci_item.citation,
            evidence=ci_item.evidence,
            notes=ci_item.notes
        )
        db.add(ci)

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
        compliance_items=[ComplianceItemResponse.model_validate(ci) for ci in scan.compliance_items],
        created_at=scan.created_at
    )
