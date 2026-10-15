import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Scan, Finding
from app.schemas import TCAnalyzeRequest, ScanResponse, FindingResponse
from app.services.tc_analyzer import TCAnalyzer
from app.auth import get_current_user

router = APIRouter(prefix="/tc", tags=["Terms & Conditions"])

def _save_tc_scan(db: Session, target_title: str, user_id: str, result: dict) -> Scan:
    scan = Scan(
        user_id=user_id,
        module_type="tc",
        target=target_title,
        overall_risk_score=result["overall_risk_score"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        metadata_json=json.dumps({"word_count": len(target_title)})
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
def analyze_tc_text(
    req: TCAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Policy text is required for analysis.")

    result = TCAnalyzer.analyze(req.text, user_api_key=req.user_api_key)
    scan = _save_tc_scan(db, req.title or "Terms of Service Analysis", current_user["uid"], result)
    
    return ScanResponse(
        id=scan.id,
        user_id=scan.user_id,
        module_type=scan.module_type,
        target=scan.target,
        overall_risk_score=scan.overall_risk_score,
        risk_level=scan.risk_level,
        summary=scan.summary,
        findings=[FindingResponse.model_validate(f) for f in scan.findings],
        created_at=scan.created_at
    )

@router.post("/upload", response_model=ScanResponse)
async def upload_tc_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    user_api_key: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        extracted_text = TCAnalyzer.extract_text_from_pdf(content)
    elif filename.endswith(".docx"):
        extracted_text = TCAnalyzer.extract_text_from_docx(content)
    elif filename.endswith(".txt") or filename.endswith(".md"):
        extracted_text = content.decode("utf-8", errors="replace")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract readable text from the document.")

    target_name = title or file.filename
    result = TCAnalyzer.analyze(extracted_text, user_api_key=user_api_key)
    scan = _save_tc_scan(db, target_name, current_user["uid"], result)

    return ScanResponse(
        id=scan.id,
        user_id=scan.user_id,
        module_type=scan.module_type,
        target=scan.target,
        overall_risk_score=scan.overall_risk_score,
        risk_level=scan.risk_level,
        summary=scan.summary,
        findings=[FindingResponse.model_validate(f) for f in scan.findings],
        created_at=scan.created_at
    )
