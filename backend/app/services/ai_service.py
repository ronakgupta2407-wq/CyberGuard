import os
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class AIService:
    """
    AI service using Groq LLM (llama-3.1-8b-instant) as primary engine.
    Falls back to heuristic templates if no API key is configured.
    """

    @staticmethod
    def is_ai_available(user_api_key: Optional[str] = None) -> bool:
        if user_api_key:
            return True
        return bool(
            os.getenv("GROQ_API_KEY", "") or
            os.getenv("GEMINI_API_KEY", "") or
            os.getenv("OPENAI_API_KEY", "")
        )

    @staticmethod
    def _call_groq(prompt: str, user_api_key: Optional[str] = None) -> Optional[str]:
        """Call Groq API and return raw text response."""
        groq_key = user_api_key or os.getenv("GROQ_API_KEY", "")
        if not groq_key:
            return None
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are CyberGuard's AI Security & Legal Risk Analyst. "
                            "Respond ONLY with valid JSON. No markdown, no extra text."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=512,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Groq API call failed: {e}")
            return None

    @staticmethod
    def _parse_json(text: str) -> Optional[Dict]:
        """Safely parse JSON, stripping markdown fences if present."""
        if not text:
            return None
        try:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception:
            return None

    # ── Clause Explanation (T&C Analyzer) ────────────────────────────────────

    @staticmethod
    def explain_clause(
        clause_text: str,
        category: str,
        risk_type: str,
        user_api_key: Optional[str] = None
    ) -> Dict[str, str]:
        """Explain a legal clause in plain English with Groq LLM."""
        prompt = f"""Analyze this clause flagged as '{risk_type}' in category '{category}':
"{clause_text}"

Respond with JSON:
{{
  "explanation": "Plain English explanation of what this clause means for the user.",
  "recommendation": "Practical action the user should take."
}}"""
        raw = AIService._call_groq(prompt, user_api_key)
        data = AIService._parse_json(raw)
        if data and "explanation" in data:
            return {
                "explanation": data.get("explanation", ""),
                "recommendation": data.get("recommendation", "")
            }
        return AIService._fallback_clause_explanation(clause_text, risk_type)

    # ── Email Phishing Analysis (Groq-powered) ───────────────────────────────

    @staticmethod
    def analyze_email_threat(
        sender: str,
        reply_to: str,
        subject: str,
        body: str,
        user_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use Groq LLM to analyze an email for phishing indicators.
        Returns structured threat assessment.
        """
        prompt = f"""Analyze this email for phishing, social engineering, and fraud indicators.

FROM: {sender}
REPLY-TO: {reply_to}
SUBJECT: {subject}
BODY:
{body[:2000]}

Respond ONLY with this JSON structure:
{{
  "threat_level": "Critical|High|Medium|Low|Safe",
  "confidence": 0.0-1.0,
  "summary": "One sentence summary of your threat assessment.",
  "indicators": [
    {{
      "type": "domain_spoofing|urgency_manipulation|credential_harvesting|brand_impersonation|suspicious_link|reply_to_mismatch|other",
      "severity": "Critical|High|Medium|Low",
      "title": "Short indicator title",
      "evidence": "Exact text or pattern from the email that triggered this",
      "explanation": "Why this is suspicious and what attackers use it for",
      "recommendation": "What the user should do"
    }}
  ]
}}"""
        raw = AIService._call_groq(prompt, user_api_key)
        data = AIService._parse_json(raw)
        if data and "threat_level" in data:
            return data
        # Fallback: return empty structured response so heuristics take over
        return {}

    # ── Compliance Gap Analysis ───────────────────────────────────────────────

    @staticmethod
    def explain_compliance_gap(
        requirement: str,
        framework: str,
        policy_text: str,
        user_api_key: Optional[str] = None
    ) -> Dict[str, str]:
        """Explain a compliance gap in plain English."""
        prompt = f"""A privacy policy was checked against {framework} requirement: "{requirement}"

Policy excerpt:
"{policy_text[:800]}"

Explain the gap and what the organization needs to add. Respond with JSON:
{{
  "explanation": "What is missing or inadequate in this policy.",
  "recommendation": "Specific language or section the policy needs to include."
}}"""
        raw = AIService._call_groq(prompt, user_api_key)
        data = AIService._parse_json(raw)
        if data and "explanation" in data:
            return data
        return {
            "explanation": f"Policy does not adequately address {framework} requirement: {requirement}.",
            "recommendation": f"Add explicit language addressing this {framework} obligation."
        }

    # ── Website Security Summary ──────────────────────────────────────────────

    @staticmethod
    def summarize_website_security(
        hostname: str,
        checks: list,
        tls_info: dict,
        user_api_key: Optional[str] = None
    ) -> str:
        """Generate a plain-English security summary for website checks."""
        failed = [c["name"] for c in checks if c.get("status") in ("failed", "warning")]
        passed = [c["name"] for c in checks if c.get("status") == "passed"]
        prompt = f"""Website security audit results for {hostname}:
Passed checks: {', '.join(passed) if passed else 'None'}
Failed/Warning checks: {', '.join(failed) if failed else 'None'}
TLS status: {tls_info.get('status', 'unknown')}

Write a 2-sentence plain English security summary for a non-technical user. No JSON needed, just the summary text."""
        raw = AIService._call_groq(prompt, user_api_key)
        if raw and len(raw) > 20:
            return raw.strip().strip('"')
        return f"Security scan completed for {hostname}. {len(failed)} check(s) require attention."

    # ── Fallback Templates ────────────────────────────────────────────────────

    @staticmethod
    def _fallback_clause_explanation(clause_text: str, risk_type: str) -> Dict[str, str]:
        explanations = {
            "unilateral_changes": {
                "explanation": "This clause allows the company to modify agreements or pricing at their discretion without advance notice or your affirmative consent.",
                "recommendation": "Monitor their policy update log regularly and verify whether continued use binds you to retroactive modifications."
            },
            "data_retention_unspecified": {
                "explanation": "The policy omits specific retention periods, meaning your data may be stored indefinitely even after inactivity or account deletion.",
                "recommendation": "Submit a formal data deletion request under GDPR (Art. 17), CCPA, or DPDP if you cease using the platform."
            },
            "data_selling_sharing": {
                "explanation": "The provider explicitly reserves the right to monetize, share, or disclose your profile and browsing habits with third-party advertisers or data brokers.",
                "recommendation": "Check for a 'Do Not Sell My Personal Information' toggle in account settings or send an opt-out notice."
            },
            "arbitration_class_waiver": {
                "explanation": "By agreeing, you surrender your right to take disputes to a public court or join class-action lawsuits, forcing individual private arbitration.",
                "recommendation": "Check if an arbitration opt-out procedure is provided (often requiring written notice within 30 days of registration)."
            },
            "liability_disclaimer": {
                "explanation": "The vendor disclaims nearly all legal liability for service outages, data breaches, or consequential damages resulting from their negligence.",
                "recommendation": "Do not rely exclusively on this service for critical operations or unbacked sensitive information."
            },
            "broad_ip_license": {
                "explanation": "The terms grant the platform a perpetual, irrevocable, worldwide, royalty-free license to use and sub-license your submitted content.",
                "recommendation": "Avoid posting proprietary code, confidential business data, or unique intellectual property."
            },
            "auto_renewal": {
                "explanation": "The subscription auto-renews automatically with recurring billing unless cancelled strictly within a narrow window prior to renewal.",
                "recommendation": "Set calendar reminders before billing cycles and document the exact cancellation workflow."
            },
            "tracking_telemetry": {
                "explanation": "The platform utilizes cross-site tracking pixels, fingerprinting, or behavioral telemetry that follows your activity across other websites.",
                "recommendation": "Use privacy-focused browser extensions (e.g. uBlock Origin) and reject non-essential marketing cookies."
            }
        }
        return explanations.get(risk_type, {
            "explanation": "This contractual provision may impose restrictions on your privacy or legal remedies.",
            "recommendation": "Carefully review the complete agreement and consider whether the service benefits justify the contractual exposure."
        })
