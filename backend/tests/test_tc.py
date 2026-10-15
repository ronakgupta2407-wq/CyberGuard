import pytest
from app.services.tc_analyzer import TCAnalyzer

def test_tc_analyzer_flags_clauses():
    sample_policy = """
    Terms of Service:
    1. Modification: We reserve the right to modify these terms at any time without prior notice at our sole discretion. Continued use constitutes acceptance.
    2. Data Retention: We retain your personal data indefinitely as long as we deem necessary for marketing purposes.
    3. Arbitration: All disputes must be resolved solely through binding individual arbitration. You waive any right to participate in a class action lawsuit or trial by jury.
    4. Sharing: We may sell, share, and monetize your browsing habits and personal information with third parties and advertising partners.
    """
    result = TCAnalyzer.analyze(sample_policy)
    assert result["overall_risk_score"] > 50
    assert result["risk_level"] in ["Medium", "High", "Critical"]
    assert len(result["findings"]) >= 4

    # Verify standard finding contract
    finding_types = [f.clause_or_check_type for f in result["findings"]]
    assert "unilateral_changes" in finding_types
    assert "data_retention_unspecified" in finding_types
    assert "arbitration_class_waiver" in finding_types
    assert "data_selling_sharing" in finding_types

    first_finding = result["findings"][0]
    assert first_finding.category in ["Privacy", "Legal Compliance"]
    assert first_finding.severity in ["Low", "Medium", "High", "Critical"]
    assert len(first_finding.evidence) > 0
    assert len(first_finding.explanation) > 0
    assert len(first_finding.recommendation) > 0
