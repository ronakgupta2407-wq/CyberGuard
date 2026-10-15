import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Scan, Finding
from app.schemas import PhishingAnalyzeRequest, ScanResponse, FindingResponse
from app.services.phishing_analyzer import PhishingAnalyzer
from app.auth import get_current_user

router = APIRouter(prefix="/phishing", tags=["Email Phishing"])

def _save_phishing_scan(db: Session, target_title: str, user_id: str, result: dict) -> Scan:
    scan = Scan(
        user_id=user_id,
        module_type="phishing",
        target=target_title,
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
    return scan

@router.post("/analyze", response_model=ScanResponse)
def analyze_email_text(
    req: PhishingAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not (req.raw_email or req.body or req.subject):
        raise HTTPException(status_code=400, detail="Email body or raw content is required.")

    result = PhishingAnalyzer.analyze(
        raw_email=req.raw_email,
        sender=req.sender,
        reply_to=req.reply_to,
        subject=req.subject,
        body=req.body,
        user_api_key=req.user_api_key
    )

    target_title = req.subject or (f"From: {req.sender}" if req.sender else "Suspicious Email Inspection")
    scan = _save_phishing_scan(db, target_title, current_user["uid"], result)

    meta = result.get("metadata", {})

    return ScanResponse(
        id=scan.id,
        user_id=scan.user_id,
        module_type=scan.module_type,
        target=scan.target,
        overall_risk_score=scan.overall_risk_score,
        risk_level=scan.risk_level,
        summary=scan.summary,
        metadata=meta,
        findings=[FindingResponse.model_validate(f) for f in scan.findings],
        created_at=scan.created_at
    )

@router.post("/upload", response_model=ScanResponse)
async def upload_eml_file(
    file: UploadFile = File(...),
    user_api_key: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".eml") or filename.endswith(".msg") or filename.endswith(".txt"):
        try:
            parsed = PhishingAnalyzer.parse_eml(content)
            result = PhishingAnalyzer.analyze(
                sender=parsed["sender"],
                reply_to=parsed["reply_to"],
                subject=parsed["subject"],
                body=parsed["body"],
                attachments=parsed.get("attachments", []),
                user_api_key=user_api_key
            )
            target_title = parsed["subject"] or file.filename
        except Exception:
            raw_text = content.decode("utf-8", errors="replace")
            result = PhishingAnalyzer.analyze(raw_email=raw_text, user_api_key=user_api_key)
            target_title = file.filename
    else:
        raise HTTPException(status_code=400, detail="Please upload a valid .eml or raw email text file.")

    scan = _save_phishing_scan(db, target_title, current_user["uid"], result)

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
