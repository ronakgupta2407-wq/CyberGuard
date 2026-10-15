import os
import json
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

class AIService:
    @staticmethod
    def is_ai_available(provider: str = "auto", user_api_key: Optional[str] = None) -> bool:
        if user_api_key:
            return True
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        openai_key = os.getenv("OPENAI_API_KEY", "")
        if provider == "gemini" and gemini_key:
            return True
        if provider == "openai" and openai_key:
            return True
        return bool(gemini_key or openai_key)

    @staticmethod
    def explain_clause(clause_text: str, category: str, risk_type: str, user_api_key: Optional[str] = None) -> Dict[str, str]:
        """
        Explains a legal clause in plain English and suggests user recommendations.
        Attempts Gemini/OpenAI if available, otherwise uses high-precision fallback templates.
        """
        gemini_key = user_api_key or os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                prompt = f"""You are CyberGuard's AI Legal & Privacy Risk Analyst.
Analyze this clause flagged as '{risk_type}' under category '{category}':
"{clause_text}"

Respond ONLY with a valid JSON object in this format:
{{
  "explanation": "Clear, plain English explanation of what this clause really means for the user and why it matters.",
  "recommendation": "Practical, actionable recommendation on what the user should do or check."
}}"""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text = response.text.strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                data = json.loads(text)
                return {
                    "explanation": data.get("explanation", ""),
                    "recommendation": data.get("recommendation", "")
                }
            except Exception as e:
                logger.warning(f"AI API explanation failed: {e}. Falling back to heuristic explanation.")

        return AIService._fallback_clause_explanation(clause_text, risk_type)

    @staticmethod
    def _fallback_clause_explanation(clause_text: str, risk_type: str) -> Dict[str, str]:
        explanations = {
            "unilateral_changes": {
                "explanation": "This clause allows the company to modify agreements, privacy rules, or pricing at their discretion without giving you advance notice or requiring your affirmative consent.",
                "recommendation": "Periodically monitor their policy update log and verify whether continuing to use the service binds you to retroactive modifications."
            },
            "data_retention_unspecified": {
                "explanation": "The policy omits specific retention periods, meaning your personal and activity data may be stored indefinitely even after inactivity.",
                "recommendation": "Submit a formal data deletion or account erasure request under GDPR (Art. 17), CCPA, or DPDP if you cease using the platform."
            },
            "data_selling_sharing": {
                "explanation": "The provider explicitly reserves the right to monetize, share, or disclose your profile and browsing habits with third-party advertisers, data brokers, or affiliates.",
                "recommendation": "Check for an explicit 'Do Not Sell or Share My Personal Information' toggle in account privacy settings or send an opt-out notice."
            },
            "arbitration_class_waiver": {
                "explanation": "By agreeing, you surrender your constitutional right to take disputes to a public court of law or join class-action lawsuits, forcing individual private arbitration where corporate repeat-players often hold an advantage.",
                "recommendation": "Check if an arbitration opt-out procedure is provided (often requiring written notice within 30 days of account registration)."
            },
            "liability_disclaimer": {
                "explanation": "The vendor disclaims nearly all legal liability for service outages, data breaches, data loss, or consequential financial damages resulting from their negligence.",
                "recommendation": "Do not rely exclusively on this service for critical business operations or unbacked sensitive information."
            },
            "broad_ip_license": {
                "explanation": "The terms grant the platform a perpetual, irrevocable, worldwide, royalty-free license to use, reproduce, modify, and sub-license your submitted content or user-generated works.",
                "recommendation": "Avoid posting proprietary code, confidential business data, or unique intellectual property without reviewing copyright carve-outs."
            },
            "auto_renewal": {
                "explanation": "The subscription auto-renews automatically with recurring payment billing unless cancelled strictly within a narrow window prior to the renewal date.",
                "recommendation": "Set calendar reminders before billing cycles and document the exact cancellation workflow in your account dashboard."
            },
            "tracking_telemetry": {
                "explanation": "The platform utilizes cross-site tracking pixels, fingerprinting, or extensive behavioral telemetry that follows your activity across other websites.",
                "recommendation": "Use privacy-focused browser extensions (e.g. uBlock Origin) and reject non-essential marketing cookies via their cookie banner."
            }
        }
        return explanations.get(risk_type, {
            "explanation": "This contractual provision may impose restrictions on your privacy or legal remedies.",
            "recommendation": "Carefully review the complete agreement and consider whether the service benefits justify the contractual exposure."
        })
