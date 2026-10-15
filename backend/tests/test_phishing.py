import pytest
from app.services.phishing_analyzer import PhishingAnalyzer

def test_phishing_sender_mismatch():
    result = PhishingAnalyzer.analyze(
        sender="Security Team <security@apple.com>",
        reply_to="attacker@malicious-harvesting.xyz",
        subject="Your Apple ID is Locked",
        body="Please verify your credentials immediately within 24 hours or your account will be suspended."
    )
    assert result["overall_risk_score"] > 60
    assert result["risk_level"] in ["High", "Critical"]
    
    types = [f.clause_or_check_type for f in result["findings"]]
    assert "mismatched_sender" in types
    assert "urgency_coercion" in types or "credential_harvesting" in types

def test_phishing_deceptive_html_link():
    html_sample = """
    <html>
        <body>
            <p>Dear customer, please log in to verify your banking credentials:</p>
            <a href="http://chase-bank-verify.top/login">https://www.chase.com/security</a>
        </body>
    </html>
    """
    result = PhishingAnalyzer.analyze(
        sender="Chase Alerts <service@chase.com>",
        subject="Security Action Needed",
        body="Verify your account using the link below.",
        raw_email=f"From: Chase <service@chase.com>\nSubject: Security\nContent-Type: text/html\n\n{html_sample}"
    )
    types = [f.clause_or_check_type for f in result["findings"]]
    assert "deceptive_link" in types or "risky_tld" in types
