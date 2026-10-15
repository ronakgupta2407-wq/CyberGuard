import re
import io
from typing import List, Dict, Any, Optional
from pypdf import PdfReader
from docx import Document
from app.schemas import FindingCreate
from app.services.ai_service import AIService

class TCAnalyzer:
    # Rule definitions for high-risk T&C clauses
    CLAUSE_RULES = [
        {
            "type": "unilateral_changes",
            "title": "Unilateral Contract Changes Without Notice",
            "category": "Legal Compliance",
            "severity": "Medium",
            "patterns": [
                r"(we (reserve the right|may)|at our sole discretion).{0,60}(modify|change|update|alter).{0,60}(these terms|this agreement|policy).{0,60}(at any time|without (prior )?notice)",
                r"(continued use|continuing to use).{0,50}(constitutes|shall constitute).{0,50}(acceptance|agreement).{0,50}(of (the )?changes|to the new terms)",
                r"terms (may be|are subject to) change without notice"
            ],
            "source": "Consumer Protection Principles & Unfair Contract Terms Guidance"
        },
        {
            "type": "data_retention_unspecified",
            "title": "Unspecified or Indefinite Data Retention",
            "category": "Privacy",
            "severity": "Medium",
            "patterns": [
                r"(retain|store|keep).{0,50}(your (personal )?data|information).{0,50}(indefinitely|as long as necessary|for as long as we deem|perpetually)",
                r"retention period.{0,50}(not specified|determined at our sole discretion)",
                r"we do not guarantee.{0,50}deletion.{0,50}(after account closure|upon request)"
            ],
            "source": "GDPR Art. 5(1)(e) & Privacy Retention Standards"
        },
        {
            "type": "data_selling_sharing",
            "title": "Third-Party Data Monetization & Sharing",
            "category": "Privacy",
            "severity": "High",
            "patterns": [
                r"(we may|reserve the right to|we reserve).{0,100}(sell|share|transfer|disclose|monetize).{0,100}(information|data|habits).{0,100}(third parties|advertisers|partners|affiliates|brokers)",
                r"(share|transfer|disclose).{0,80}(information|data).{0,80}(with sponsors|commercial partners|data brokers|third parties)",
                r"commercial use of your (profile|demographic|usage) data"
            ],
            "source": "CCPA § 1798.120 & Transparency Standards"
        },
        {
            "type": "arbitration_class_waiver",
            "title": "Mandatory Binding Arbitration & Class Action Waiver",
            "category": "Legal Compliance",
            "severity": "High",
            "patterns": [
                r"(waive|give up).{0,50}(right to (participate in )?a class action|trial by jury|class action lawsuit)",
                r"(disputes|claims).{0,60}(shall|must|will) be resolved (solely )?by (binding )?arbitration",
                r"exclusive resolution through (the american arbitration association|jams|individual arbitration)"
            ],
            "source": "Civil Dispute Due Process & Legal Rights Evaluation"
        },
        {
            "type": "liability_disclaimer",
            "title": "Comprehensive Limitation of Liability & Warranty Disclaimer",
            "category": "Legal Compliance",
            "severity": "Medium",
            "patterns": [
                r"(provided|services are provided)[\s\S]{0,30}\"as is\" and \"as available\"",
                r"(in no event|shall not be liable)[\s\S]{0,60}(for any (direct|indirect|incidental|punitive|consequential) damages|data loss|loss of profits)",
                r"(aggregate|total) liability.{0,40}(shall not exceed|limited to).{0,40}(\$[0-9]+|amount paid)"
            ],
            "source": "Contractual Fairness Standards"
        },
        {
            "type": "broad_ip_license",
            "title": "Excessive Intellectual Property & Content Transfer",
            "category": "Legal Compliance",
            "severity": "Medium",
            "patterns": [
                r"you grant (us|the company).{0,60}(perpetual|irrevocable|worldwide|royalty-free|unlimited).{0,60}(license|right).{0,60}(to use|reproduce|modify|distribute|sub-license|monetize)",
                r"ownership of user (content|submissions|feedback).{0,50}(transferred to|belongs to us)"
            ],
            "source": "Intellectual Property Rights Protection"
        },
        {
            "type": "auto_renewal",
            "title": "Continuous Recurring Billing & Auto-Renewal",
            "category": "Legal Compliance",
            "severity": "Medium",
            "patterns": [
                r"(subscription|service).{0,40}(automatically renews|will auto-renew).{0,40}(unless cancelled|without further notice)",
                r"(fees|charges).{0,40}(non-refundable|cannot be refunded).{0,40}(under any circumstances|in whole or in part)",
                r"recurring (monthly|annual) billing cycle.{0,40}charged automatically"
            ],
            "source": "FTC Negative Option Rule & Consumer Fairness"
        },
        {
            "type": "tracking_telemetry",
            "title": "Cross-Site Profiling & Behavioral Tracking",
            "category": "Privacy",
            "severity": "Medium",
            "patterns": [
                r"(we use|may employ).{0,50}(cross-site tracking|device fingerprinting|web beacons|pixels|behavioral advertising)",
                r"(track|monitor).{0,50}(your activity across (other )?(websites|applications|devices))",
                r"combine your information with data from third-party (data brokers|sources)"
            ],
            "source": "ePrivacy Directive & Tracking Transparency"
        },
        {
            "type": "unilateral_termination",
            "title": "Arbitrary Account Termination Without Cause",
            "category": "Legal Compliance",
            "severity": "Low",
            "patterns": [
                r"(we may|reserve the right to).{0,50}(terminate|suspend|deactivate).{0,50}(your account|access).{0,50}(at any time|without cause|without (prior )?notice|for any reason)",
                r"termination of service without liability or refund"
            ],
            "source": "Digital Service Rights Standards"
        }
    ]

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extract plain text from PDF bytes."""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Could not parse PDF document: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        """Extract plain text from DOCX bytes."""
        try:
            doc = Document(io.BytesIO(file_bytes))
            text = [paragraph.text for paragraph in doc.paragraphs if paragraph.text]
            return "\n".join(text).strip()
        except Exception as e:
            raise ValueError(f"Could not parse DOCX document: {str(e)}")

    @classmethod
    def clean_text(cls, text: str) -> str:
        """Normalize linebreaks and spacing."""
        text = re.sub(r"\r\n|\r", "\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @classmethod
    def analyze(cls, text: str, user_api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze Terms & Conditions / Privacy Policy text.
        Identifies concerning clauses, classifies severity, generates plain-English explanations,
        and derives an overall score.
        """
        cleaned = cls.clean_text(text)
        if not cleaned:
            return {
                "overall_risk_score": 0,
                "risk_level": "Safe",
                "summary": "No text provided for analysis.",
                "findings": []
            }

        findings: List[FindingCreate] = []
        # Split text into paragraphs/clauses for granular matching
        paragraphs = [p.strip() for p in cleaned.split("\n") if len(p.strip()) > 30]

        matched_types = set()

        for rule in cls.CLAUSE_RULES:
            rule_type = rule["type"]
            matched_snippet = ""
            
            # Check compiled regex against both full text and individual paragraphs
            for pattern in rule["patterns"]:
                match = re.search(pattern, cleaned, re.IGNORECASE)
                if match:
                    # Find the enclosing sentence or paragraph
                    start = max(0, match.start() - 100)
                    end = min(len(cleaned), match.end() + 150)
                    matched_snippet = cleaned[start:end].strip()
                    # Clean up ellipsis
                    if start > 0:
                        matched_snippet = "..." + matched_snippet
                    if end < len(cleaned):
                        matched_snippet = matched_snippet + "..."
                    break

            if matched_snippet and rule_type not in matched_types:
                matched_types.add(rule_type)
                
                # Generate AI explanation & recommendation
                ai_info = AIService.explain_clause(
                    clause_text=matched_snippet,
                    category=rule["category"],
                    risk_type=rule_type,
                    user_api_key=user_api_key
                )

                findings.append(FindingCreate(
                    category=rule["category"],
                    severity=rule["severity"],
                    title=rule["title"],
                    evidence=matched_snippet,
                    explanation=ai_info["explanation"],
                    recommendation=ai_info["recommendation"],
                    confidence=0.88,
                    source=rule["source"],
                    clause_or_check_type=rule_type
                ))

        # Calculate score: baseline 15, add weighted penalties
        score = 15
        for f in findings:
            if f.severity == "Critical":
                score += 25
            elif f.severity == "High":
                score += 18
            elif f.severity == "Medium":
                score += 10
            elif f.severity == "Low":
                score += 4
        
        score = min(score, 98) if findings else 12

        if score >= 75:
            risk_level = "High"
        elif score >= 50:
            risk_level = "Medium"
        elif score >= 25:
            risk_level = "Low"
        else:
            risk_level = "Safe"

        summary = (
            f"Evaluated policy text ({len(cleaned.split())} words). "
            f"Detected {len(findings)} clause{'s' if len(findings) != 1 else ''} of note "
            f"resulting in a {risk_level} contractual risk rating ({score}/100). "
            "Note: These findings indicate potential concerns for user scrutiny, not an automatic legal violation."
        )

        return {
            "overall_risk_score": score,
            "risk_level": risk_level,
            "summary": summary,
            "findings": findings
        }
