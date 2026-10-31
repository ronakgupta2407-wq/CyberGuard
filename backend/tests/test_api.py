from datetime import datetime
from io import BytesIO
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader
from app.main import app
from app.services.ai_service import AIService
from app.services.report_generator import ReportGenerator

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["ai_available"] is True

def test_tc_analyze_api():
    payload = {
        "text": "We reserve the right to modify these terms at any time without notice. Continued use is acceptance.",
        "title": "API Test Policy"
    }
    res = client.post("/api/tc/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["module_type"] == "tc"
    assert len(data["findings"]) >= 1

def test_scans_list_and_pdf():
    # Fetch list
    res = client.get("/api/scans")
    assert res.status_code == 200
    scans = res.json()
    assert len(scans) > 0

    scan_id = scans[0]["id"]
    assert "finding_count" in scans[0]
    assert "key_findings" in scans[0]
    assert len(scans[0]["key_findings"]) <= 3
    if scans[0]["key_findings"]:
        assert {"evidence", "explanation", "recommendation"} <= scans[0]["key_findings"][0].keys()
    # Fetch scan detail
    detail_res = client.get(f"/api/scans/{scan_id}")
    assert detail_res.status_code == 200

    # Fetch PDF export
    pdf_res = client.get(f"/api/scans/{scan_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 500 # Valid PDF bytes

def test_pdf_includes_plain_language_issue_fix_and_risk_summary():
    pdf_bytes = ReportGenerator.generate_pdf({
        "id": "test-summary",
        "module_type": "tc",
        "target": "Example Terms of Service",
        "overall_risk_score": 72,
        "risk_level": "High",
        "summary": "Policy check completed.",
        "created_at": datetime(2026, 10, 29),
        "findings": [
            SimpleNamespace(
                severity="High",
                title="Third-party data sharing",
                evidence="Information may be shared with advertisers.",
                explanation="Your information may be used for advertising.",
                recommendation="Ask for a clear opt-out and restrict sharing to necessary service providers.",
                source="Privacy guidance",
            ),
        ],
        "compliance_items": [],
        "metadata": {},
    })
    reader = PdfReader(BytesIO(pdf_bytes))
    pdf_text = "\n".join(page.extract_text() or "" for page in reader.pages)

    assert "Short summary" in pdf_text
    assert "1 issue flagged in this Terms of Service" in pdf_text
    assert "Detailed summary" in pdf_text
    assert "72" in pdf_text
    assert "HIGH RISK" in pdf_text
    assert "Third-party data sharing" in pdf_text
    assert "Evidence" in pdf_text
    assert "advertisers" in pdf_text
    assert "Why it matters" in pdf_text
    assert "used for advertising" in pdf_text
    assert "Ask for a clear opt-out" in pdf_text

def test_scans_compare():
    scans = client.get("/api/scans").json()
    if len(scans) >= 2:
        compare_payload = {
            "scan_id_1": scans[0]["id"],
            "scan_id_2": scans[1]["id"]
        }
        res = client.post("/api/scans/compare", json=compare_payload)
        assert res.status_code == 200
        data = res.json()
        assert "score_difference" in data
        assert "comparison_summary" in data

def test_groq_ai_service_fallback_and_prompting():
    # Test fallback
    exp = AIService.explain_clause(
        clause_text="We may modify these terms at any time without prior notice.",
        category="Legal Compliance",
        risk_type="unilateral_changes",
        user_api_key=None
    )
    assert "explanation" in exp
    assert "recommendation" in exp
    assert len(exp["explanation"]) > 10

def test_gmail_import_routes_are_removed():
    res = client.get("/api/gmail/messages")
    assert res.status_code == 404
