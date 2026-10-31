import json
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import AppState, Scan, Finding, ComplianceItem
from app.schemas import (
    ScanResponse, ScanSummaryResponse, KeyFindingResponse, ScanCompareRequest, ScanCompareResponse,
    FindingResponse, ComplianceItemResponse
)
from app.services.report_generator import ReportGenerator
from app.auth import get_current_user

router = APIRouter(prefix="/scans", tags=["Scans & Reports"])

@router.delete("")
def delete_all_scans(db: Session = Depends(get_db)):
    finding_count = db.query(Finding).delete(synchronize_session=False)
    compliance_item_count = db.query(ComplianceItem).delete(synchronize_session=False)
    scan_count = db.query(Scan).delete(synchronize_session=False)
    seed_marker = db.query(AppState).filter(AppState.key == "demo_data_seeded").first()
    if seed_marker is None:
        db.add(AppState(key="demo_data_seeded", value="true"))
    else:
        seed_marker.value = "true"
    db.commit()

    return {
        "status": "success",
        "deleted_count": scan_count,
        "deleted_findings": finding_count,
        "deleted_compliance_items": compliance_item_count,
    }

@router.get("", response_model=List[ScanSummaryResponse])
def get_all_scans(
    module_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(Scan)
    # If authenticated, optionally filter by user or show all for guest/analyst
    if module_type:
        query = query.filter(Scan.module_type == module_type)

    scans = query.order_by(Scan.created_at.desc()).limit(limit).all()

    results = []
    for s in scans:
        finding_counts = {}
        for f in s.findings:
            finding_counts[f.severity] = finding_counts.get(f.severity, 0) + 1
        ordered_findings = sorted(
            s.findings,
            key=lambda finding: {
                "Critical": 0,
                "High": 1,
                "Medium": 2,
                "Low": 3,
                "Informational": 4,
            }.get(finding.severity, 5),
        )

        results.append(ScanSummaryResponse(
            id=s.id,
            user_id=s.user_id,
            module_type=s.module_type,
            target=s.target,
            overall_risk_score=s.overall_risk_score,
            risk_level=s.risk_level,
            summary=s.summary,
            created_at=s.created_at,
            finding_count=len(s.findings),
            finding_counts=finding_counts,
            key_findings=[
                KeyFindingResponse(
                    category=f.category or "",
                    severity=f.severity,
                    title=f.title,
                    evidence=f.evidence or "",
                    explanation=f.explanation or "",
                    recommendation=f.recommendation or "",
                )
                for f in ordered_findings[:3]
            ],
        ))

    return results

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(
    scan_id: str,
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    meta = {}
    try:
        meta = json.loads(scan.metadata_json) if scan.metadata_json else {}
    except Exception:
        pass

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
        compliance_items=[ComplianceItemResponse.model_validate(ci) for ci in scan.compliance_items],
        created_at=scan.created_at
    )

@router.get("/{scan_id}/pdf")
def export_scan_pdf(
    scan_id: str,
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    meta = {}
    try:
        meta = json.loads(scan.metadata_json) if scan.metadata_json else {}
    except Exception:
        pass

    scan_data = {
        "id": scan.id,
        "module_type": scan.module_type,
        "target": scan.target,
        "overall_risk_score": scan.overall_risk_score,
        "risk_level": scan.risk_level,
        "summary": scan.summary,
        "created_at": scan.created_at,
        "findings": scan.findings,
        "compliance_items": scan.compliance_items,
        "metadata": meta
    }

    pdf_bytes = ReportGenerator.generate_pdf(scan_data)
    filename = f"cyberguard_report_{scan.module_type}_{scan.id[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.post("/compare", response_model=ScanCompareResponse)
def compare_scans(
    req: ScanCompareRequest,
    db: Session = Depends(get_db)
):
    scan1 = db.query(Scan).filter(Scan.id == req.scan_id_1).first()
    scan2 = db.query(Scan).filter(Scan.id == req.scan_id_2).first()

    if not scan1 or not scan2:
        raise HTTPException(status_code=404, detail="One or both scans could not be found.")

    s1_titles = {f.title: f for f in scan1.findings}
    s2_titles = {f.title: f for f in scan2.findings}

    common_titles = set(s1_titles.keys()) & set(s2_titles.keys())
    new_in_2 = set(s2_titles.keys()) - set(s1_titles.keys())
    resolved_in_2 = set(s1_titles.keys()) - set(s2_titles.keys())

    score_diff = scan2.overall_risk_score - scan1.overall_risk_score

    if score_diff > 0:
        comp_summary = f"Risk increased by {score_diff} points. Detected {len(new_in_2)} new risk findings."
    elif score_diff < 0:
        comp_summary = f"Risk decreased by {abs(score_diff)} points! {len(resolved_in_2)} previous findings were mitigated."
    else:
        comp_summary = "Risk score remained identical across the compared scans."

    meta1 = json.loads(scan1.metadata_json or "{}")
    meta2 = json.loads(scan2.metadata_json or "{}")

    s1_resp = ScanResponse(
        id=scan1.id,
        user_id=scan1.user_id,
        module_type=scan1.module_type,
        target=scan1.target,
        overall_risk_score=scan1.overall_risk_score,
        risk_level=scan1.risk_level,
        summary=scan1.summary,
        metadata=meta1,
        findings=[FindingResponse.model_validate(f) for f in scan1.findings],
        compliance_items=[ComplianceItemResponse.model_validate(ci) for ci in scan1.compliance_items],
        created_at=scan1.created_at
    )

    s2_resp = ScanResponse(
        id=scan2.id,
        user_id=scan2.user_id,
        module_type=scan2.module_type,
        target=scan2.target,
        overall_risk_score=scan2.overall_risk_score,
        risk_level=scan2.risk_level,
        summary=scan2.summary,
        metadata=meta2,
        findings=[FindingResponse.model_validate(f) for f in scan2.findings],
        compliance_items=[ComplianceItemResponse.model_validate(ci) for ci in scan2.compliance_items],
        created_at=scan2.created_at
    )

    return ScanCompareResponse(
        scan_1=s1_resp,
        scan_2=s2_resp,
        score_difference=score_diff,
        new_findings=[FindingResponse.model_validate(s2_titles[t]) for t in new_in_2],
        resolved_findings=[FindingResponse.model_validate(s1_titles[t]) for t in resolved_in_2],
        common_findings=[FindingResponse.model_validate(s2_titles[t]) for t in common_titles],
        comparison_summary=comp_summary
    )

@router.delete("/{scan_id}")
def delete_scan(
    scan_id: str,
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    db.delete(scan)
    db.commit()
    return {"status": "success", "message": f"Scan {scan_id} deleted successfully."}
