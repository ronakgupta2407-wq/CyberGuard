from typing import List, Dict, Any, Optional
from app.schemas import FindingCreate, FindingResponse
from app.services.tc_analyzer import TCAnalyzer
from app.services.phishing_analyzer import PhishingAnalyzer
from app.services.website_checker import WebsiteChecker
from app.services.compliance_checker import ComplianceChecker

class UnifiedRiskEngine:
    SEVERITY_WEIGHTS = {
        "Critical": 35,
        "High": 20,
        "Medium": 10,
        "Low": 4,
        "Informational": 1
    }

    SEVERITY_ORDER = {
        "Critical": 0,
        "High": 1,
        "Medium": 2,
        "Low": 3,
        "Informational": 4
    }

    @classmethod
    def calculate_composite_score(cls, findings: List[Any]) -> Dict[str, Any]:
        """Calculate weighted risk score (0 - 100) and risk level based on aggregated findings."""
        if not findings:
            return {
                "score": 10,
                "risk_level": "Safe",
                "breakdown": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Informational": 0}
            }

        breakdown = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Informational": 0}
        total_penalty = 12

        for f in findings:
            sev = getattr(f, "severity", "Low")
            breakdown[sev] = breakdown.get(sev, 0) + 1
            total_penalty += cls.SEVERITY_WEIGHTS.get(sev, 5)

        score = min(total_penalty, 99)

        if score >= 75:
            risk_level = "High" if score < 90 else "Critical"
        elif score >= 50:
            risk_level = "Medium"
        elif score >= 25:
            risk_level = "Low"
        else:
            risk_level = "Safe"

        return {
            "score": score,
            "risk_level": risk_level,
            "breakdown": breakdown
        }

    @classmethod
    async def run_unified_audit(
        cls,
        url: Optional[str] = None,
        policy_text: Optional[str] = None,
        email_text: Optional[str] = None,
        user_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run consolidated multi-vector risk audit across website, legal policy, and email artifacts.
        """
        all_findings: List[FindingCreate] = []
        all_compliance_items = []
        module_summaries = []
        meta = {}

        # 1. Website Checks if URL provided
        if url and url.strip():
            try:
                web_result = await WebsiteChecker.inspect_website(url.strip())
                all_findings.extend(web_result.get("findings", []))
                module_summaries.append(f"Website ({url}): {web_result['risk_level']} Risk ({web_result['overall_risk_score']}/100)")
                meta["website_checks"] = web_result.get("metadata", {})
            except Exception as e:
                module_summaries.append(f"Website check failed: {str(e)}")

        # 2. Terms & Privacy Policy if text provided
        if policy_text and policy_text.strip():
            tc_result = TCAnalyzer.analyze(policy_text, user_api_key=user_api_key)
            all_findings.extend(tc_result.get("findings", []))
            module_summaries.append(f"Terms Analysis: {tc_result['risk_level']} Risk ({tc_result['overall_risk_score']}/100)")

            comp_result = ComplianceChecker.evaluate(policy_text)
            all_findings.extend(comp_result.get("findings", []))
            all_compliance_items.extend(comp_result.get("compliance_items", []))
            module_summaries.append(f"Compliance: {comp_result['risk_level']} Risk ({comp_result['overall_risk_score']}/100)")
            meta["compliance_stats"] = comp_result.get("stats", {})

        # 3. Email Phishing if email text provided
        if email_text and email_text.strip():
            email_result = PhishingAnalyzer.analyze(raw_email=email_text, user_api_key=user_api_key)
            all_findings.extend(email_result.get("findings", []))
            module_summaries.append(f"Phishing Analysis: {email_result['risk_level']} Risk ({email_result['overall_risk_score']}/100)")
            meta["email_meta"] = email_result.get("metadata", {})

        # Sort findings by severity
        all_findings.sort(key=lambda x: cls.SEVERITY_ORDER.get(x.severity, 99))

        scoring = cls.calculate_composite_score(all_findings)
        score = scoring["score"]
        risk_level = scoring["risk_level"]

        summary = (
            f"Consolidated CyberGuard Risk Assessment: {risk_level} Risk ({score}/100). "
            f"Evaluated across {len(module_summaries)} module{'s' if len(module_summaries) != 1 else ''}. "
            f"Identified {len(all_findings)} total risk finding{'s' if len(all_findings) != 1 else ''} "
            f"({scoring['breakdown']['Critical']} Critical, {scoring['breakdown']['High']} High, "
            f"{scoring['breakdown']['Medium']} Medium, {scoring['breakdown']['Low']} Low). "
            + (" | ".join(module_summaries))
        )

        return {
            "overall_risk_score": score,
            "risk_level": risk_level,
            "summary": summary,
            "findings": all_findings,
            "compliance_items": all_compliance_items,
            "metadata": meta
        }
