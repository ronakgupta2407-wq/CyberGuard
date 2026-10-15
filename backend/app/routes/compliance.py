import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Scan, Finding, ComplianceItem
from app.schemas import ComplianceCheckRequest, ScanResponse, FindingResponse, ComplianceItemResponse
from app.services.compliance_checker import ComplianceChecker
from app.auth import get_current_user

router = APIRouter(prefix="/compliance", tags=["Privacy Compliance"])

@router.post("/check", response_model=ScanResponse)
def check_privacy_compliance(
    req: ComplianceCheckRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Policy text is required for compliance audit.")

    result = ComplianceChecker.evaluate(req.text, frameworks=req.frameworks)

    scan = Scan(
        user_id=current_user["uid"],
        module_type="compliance",
        target=req.title or "Multi-Framework Privacy Compliance Audit",
        overall_risk_score=result["overall_risk_score"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        metadata_json=json.dumps(result.get("stats", {}))
    )
    db.add(scan)
    db.flush()

    # Save Findings
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

    # Save Compliance Items
    for item in result["compliance_items"]:
        ci = ComplianceItem(
            scan_id=scan.id,
            framework=item.framework,
            requirement_id=item.requirement_id,
            requirement_title=item.requirement_title,
            status=item.status,
            citation=item.citation,
            evidence=item.evidence,
            notes=item.notes
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
        metadata=result.get("stats", {}),
        findings=[FindingResponse.model_validate(f) for f in scan.findings],
        compliance_items=[ComplianceItemResponse.model_validate(ci) for ci in scan.compliance_items],
        created_at=scan.created_at
    )
