import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

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
    # Fetch scan detail
    detail_res = client.get(f"/api/scans/{scan_id}")
    assert detail_res.status_code == 200

    # Fetch PDF export
    pdf_res = client.get(f"/api/scans/{scan_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 500 # Valid PDF bytes

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
