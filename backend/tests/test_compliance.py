import pytest
from app.services.compliance_checker import ComplianceChecker

def test_compliance_gdpr_and_dpdp():
    policy = """
    Privacy Policy:
    We process your data based on legitimate interests and consent as our lawful basis.
    You have the right to request deletion of your personal data ('right to be forgotten') under GDPR Article 17.
    You may contact our Data Protection Officer at dpo@example.com.
    Under India's Digital Personal Data Protection Act, our grievance officer can be reached at grievance@example.com.
    """
    res = ComplianceChecker.evaluate(policy, frameworks=["GDPR", "DPDP"])
    assert res["overall_risk_score"] < 70
    assert len(res["compliance_items"]) > 0

    statuses = {ci.requirement_id: ci.status for ci in res["compliance_items"]}
    assert statuses.get("GDPR-01") == "Supported"
    assert statuses.get("GDPR-03") == "Supported"
    assert statuses.get("GDPR-05") == "Supported"
    assert statuses.get("DPDP-03") == "Supported"
