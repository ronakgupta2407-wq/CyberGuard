import re
import email
from email import policy
from email.parser import BytesParser
from typing import Dict, Any, List, Optional
import tldextract
from app.schemas import FindingCreate

class PhishingAnalyzer:
    KNOWN_BRANDS = [
        "paypal", "apple", "microsoft", "google", "amazon", "netflix",
        "chase", "bank of america", "wells fargo", "citibank", "fedex",
        "ups", "dhl", "usps", "irs", "facebook", "meta", "instagram",
        "dropbox", "docuSign", "coinbase", "binance"
    ]

    RISKY_TLDS = {
        "xyz", "top", "tk", "ml", "ga", "cf", "gq", "work", "click",
        "link", "live", "loan", "cc", "buzz", "surf", "fit", "racing"
    }

    URL_SHORTENERS = {
        "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "ow.ly", "buff.ly", "rebrand.ly"
    }

    URGENCY_PATTERNS = [
        r"(immediate(ly)? action (is )?required|action required immediately)",
        r"(within (24|48) hours|immediately|today)[\s\S]{0,60}(suspended|terminated|deactivated|closed|locked)",
        r"(account|access|service)[\s\S]{0,50}(suspended|terminated|deactivated|closed|locked)[\s\S]{0,50}(within (24|48) hours|immediately|today)",
        r"(unauthorized|suspicious) (activity|login|access).{0,40}(detected|flagged|reported)",
        r"failure to (respond|verify|update).{0,40}(will result in|may lead to).{0,40}(termination|permanent loss|suspension)",
        r"(urgent|final) notice.{0,30}(regarding your account|payment failure)"
    ]

    CREDENTIAL_PATTERNS = [
        r"(verify|confirm|validate|update).{0,40}(your )?(credentials|password|login credentials|pin|security questions|passcode)",
        r"(enter|provide).{0,30}(your (social security|ssn|credit card|billing address|card number|cvv))",
        r"(log in|sign in).{0,30}(to secure your account|to prevent cancellation|using the link below)",
        r"(wire transfer|gift card|bitcoin|crypto|send money).{0,30}(immediately|to verify)"
    ]

    @staticmethod
    def parse_eml(file_bytes: bytes) -> Dict[str, Any]:
        """Parse raw .eml bytes into structured headers, body, and attachments."""
        msg = BytesParser(policy=policy.default).parsebytes(file_bytes)
        
        sender = msg.get("From", "")
        reply_to = msg.get("Reply-To", "")
        subject = msg.get("Subject", "")
        date = msg.get("Date", "")

        # Extract body
        body = ""
        html_body = ""
        attachments = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                
                if "attachment" in content_disposition:
                    filename = part.get_filename() or "unnamed_attachment"
                    attachments.append(filename)
                elif content_type == "text/plain" and not body:
                    body = part.get_payload(decode=True).decode(errors="replace")
                elif content_type == "text/html" and not html_body:
                    html_body = part.get_payload(decode=True).decode(errors="replace")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode(errors="replace")
            else:
                body = msg.get_payload() or ""

        full_content = body or html_body

        return {
            "sender": str(sender),
            "reply_to": str(reply_to),
            "subject": str(subject),
            "date": str(date),
            "body": full_content,
            "html_body": html_body,
            "attachments": attachments
        }

    @staticmethod
    def extract_urls(text: str, html: str = "") -> List[Dict[str, str]]:
        """Extract URLs and inspect anchor text discrepancies safely."""
        urls = []
        seen = set()

        # HTML anchor extraction: <a href="target">visible text</a>
        if html:
            anchor_pattern = re.compile(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', re.IGNORECASE | re.DOTALL)
            for href, anchor_text in anchor_pattern.findall(html):
                clean_anchor = re.sub(r'<[^>]+>', '', anchor_text).strip()
                if href and href not in seen and not href.startswith("mailto:"):
                    seen.add(href)
                    urls.append({
                        "url": href,
                        "anchor_text": clean_anchor
                    })

        # Plain text URL regex
        url_pattern = re.compile(r'https?://[^\s<>"\')]+', re.IGNORECASE)
        for u in url_pattern.findall(text):
            if u not in seen:
                seen.add(u)
                urls.append({
                    "url": u,
                    "anchor_text": u
                })

        return urls

    @classmethod
    def analyze(
        cls,
        raw_email: Optional[str] = None,
        sender: Optional[str] = None,
        reply_to: Optional[str] = None,
        subject: Optional[str] = None,
        body: Optional[str] = None,
        attachments: Optional[List[str]] = None,
        user_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive Phishing Analysis inspecting headers, sender domain mismatches,
        brand impersonation, deceptive URLs, urgency, and credential requests.
        """
        html_body = ""
        extracted_attachments = attachments or []

        # If raw email text is provided, try parsing it as RFC 822 format
        if raw_email:
            try:
                parsed = cls.parse_eml(raw_email.encode("utf-8", errors="replace"))
                sender = parsed.get("sender") or sender or ""
                reply_to = parsed.get("reply_to") or reply_to or ""
                subject = parsed.get("subject") or subject or ""
                body = parsed.get("body") or body or raw_email
                html_body = parsed.get("html_body", "")
                if parsed.get("attachments"):
                    extracted_attachments.extend(parsed["attachments"])
            except Exception:
                body = body or raw_email

        sender = sender or ""
        reply_to = reply_to or ""
        subject = subject or ""
        body = body or ""

        findings: List[FindingCreate] = []

        # 1. Inspect Sender vs Reply-To Mismatch
        sender_email_match = re.search(r'[\w\.-]+@([\w\.-]+)', sender)
        reply_email_match = re.search(r'[\w\.-]+@([\w\.-]+)', reply_to)

        sender_domain = ""
        reply_domain = ""

        if sender_email_match:
            sender_domain_raw = sender_email_match.group(1).lower()
            ext_s = tldextract.extract(sender_domain_raw)
            sender_domain = f"{ext_s.domain}.{ext_s.suffix}" if ext_s.suffix else sender_domain_raw

        if reply_email_match:
            reply_domain_raw = reply_email_match.group(1).lower()
            ext_r = tldextract.extract(reply_domain_raw)
            reply_domain = f"{ext_r.domain}.{ext_r.suffix}" if ext_r.suffix else reply_domain_raw

        if sender_domain and reply_domain and sender_domain != reply_domain:
            findings.append(FindingCreate(
                category="Phishing",
                severity="High",
                title="Mismatched Sender and Reply-To Header Domains",
                evidence=f"From: {sender} | Reply-To: {reply_to}",
                explanation="The visible sender domain differs from where replies will actually be routed. Attackers often spoof a legitimate From header while routing recipient responses to their own controlled mailbox.",
                recommendation="Do not reply to this email. Verify the sender's identity through official out-of-band communication channels.",
                confidence=0.92,
                source="RFC 5322 & Anti-Phishing Working Group (APWG)",
                clause_or_check_type="mismatched_sender"
            ))

        # 2. Display Name Spoofing & Brand Impersonation
        sender_lower = sender.lower()
        for brand in cls.KNOWN_BRANDS:
            if brand in sender_lower:
                # Check if sender email domain actually matches the brand
                if sender_domain and brand not in sender_domain:
                    findings.append(FindingCreate(
                        category="Phishing",
                        severity="High",
                        title=f"Brand Impersonation in Sender Display Name ({brand.capitalize()})",
                        evidence=f"Sender claims '{brand}' but domain is '{sender_domain}'",
                        explanation=f"The sender's display name or header references {brand.capitalize()}, but the actual sending domain is not affiliated with this organization.",
                        recommendation="Treat this message as an unauthorized impersonation attempt. Avoid clicking any included links or providing account details.",
                        confidence=0.95,
                        source="NIST SP 800-177 Trustworthy Email Guidelines",
                        clause_or_check_type="display_name_spoofing"
                    ))
                    break

        # 3. URL Inspections
        extracted_urls = cls.extract_urls(body, html_body)
        for item in extracted_urls:
            url_str = item["url"]
            anchor = item.get("anchor_text", "")
            
            # Check deceptive anchor vs target href
            if anchor and ("http://" in anchor or "https://" in anchor or ".com" in anchor):
                anchor_match = re.search(r'https?://([^/\s]+)', anchor)
                url_match = re.search(r'https?://([^/\s]+)', url_str)
                if anchor_match and url_match:
                    anchor_host = anchor_match.group(1).lower()
                    url_host = url_match.group(1).lower()
                    if anchor_host != url_host:
                        findings.append(FindingCreate(
                            category="Phishing",
                            severity="High",
                            title="Deceptive Hyperlink Destination Discrepancy",
                            evidence=f"Displayed Link Text: '{anchor}' -> Actual Target URL: '{url_str}'",
                            explanation="The visible link text depicts a reputable destination, but clicking will navigate to an entirely different host. This is a classic credential harvesting technique.",
                            recommendation="Do not click this link. Manually type known official URLs into your browser address bar instead.",
                            confidence=0.98,
                            source="OWASP Phishing Defense Guidance",
                            clause_or_check_type="deceptive_link"
                        ))

            # Check IP-based URLs
            if re.search(r'https?://(?:\d{1,3}\.){3}\d{1,3}', url_str):
                findings.append(FindingCreate(
                    category="Phishing",
                    severity="High",
                    title="Direct IP Address in Hyperlink",
                    evidence=f"Link target: {url_str}",
                    explanation="Legitimate organizations use registered domain names. Using raw IP addresses bypasses standard domain reputation filters and hides malicious infrastructure.",
                    recommendation="Never submit credentials or personal information to IP-based URLs.",
                    confidence=0.95,
                    source="CISA Phishing Indicators Guide",
                    clause_or_check_type="ip_in_url"
                ))

            # Check Risky TLDs
            ext_u = tldextract.extract(url_str)
            if ext_u.suffix and ext_u.suffix.lower() in cls.RISKY_TLDS:
                findings.append(FindingCreate(
                    category="Phishing",
                    severity="Medium",
                    title=f"Link Targets High-Risk Top-Level Domain (.{ext_u.suffix})",
                    evidence=f"URL: {url_str}",
                    explanation=f"The top-level domain '.{ext_u.suffix}' has a statistically elevated association with disposable phishing campaigns and spam operations.",
                    recommendation="Verify the domain authenticity before interacting.",
                    confidence=0.85,
                    source="Spamhaus TLD Reputation Matrix",
                    clause_or_check_type="risky_tld"
                ))

            # Check URL Shorteners
            host_lower = f"{ext_u.domain}.{ext_u.suffix}".lower()
            if host_lower in cls.URL_SHORTENERS:
                findings.append(FindingCreate(
                    category="Phishing",
                    severity="Low",
                    title="Obfuscated Link via URL Shortener Service",
                    evidence=f"Shortened URL: {url_str}",
                    explanation="URL shorteners obscure the ultimate destination, preventing pre-click validation and hiding malicious redirection chains.",
                    recommendation="Use a link unshortener or URL expander tool before navigating.",
                    confidence=0.80,
                    source="MITRE ATT&CK T1566 Phishing",
                    clause_or_check_type="url_shortener"
                ))

        # 4. Urgency and Psychological Coercion Triggers
        full_text = f"{subject}\n{body}"
        for pat in cls.URGENCY_PATTERNS:
            match = re.search(pat, full_text, re.IGNORECASE)
            if match:
                snippet = match.group(0)
                findings.append(FindingCreate(
                    category="Phishing",
                    severity="Medium",
                    title="Artificial Urgency & Coercive Deadline Tactics",
                    evidence=f"Detected trigger: \"{snippet}\"",
                    explanation="Phishing emails deliberately engineer synthetic deadlines (e.g. 24-hour suspension threats) to induce panic, bypassing critical scrutiny.",
                    recommendation="Take a step back. Legitimate service providers rarely shut down established accounts without prior notices across multiple channels.",
                    confidence=0.88,
                    source="Social Engineering Defense Principles",
                    clause_or_check_type="urgency_coercion"
                ))
                break

        # 5. Credential Harvesting & Financial Demands
        for pat in cls.CREDENTIAL_PATTERNS:
            match = re.search(pat, full_text, re.IGNORECASE)
            if match:
                snippet = match.group(0)
                findings.append(FindingCreate(
                    category="Phishing",
                    severity="High",
                    title="Direct Request for Sensitive Credentials or Wire Transfer",
                    evidence=f"Detected request: \"{snippet}\"",
                    explanation="The message solicits sensitive credentials, passwords, or immediate financial transfers. Reputable institutions never request password verification via email links.",
                    recommendation="Never supply credentials or financial information in response to an email prompt.",
                    confidence=0.92,
                    source="FTC Phishing Scam Guidelines",
                    clause_or_check_type="credential_harvesting"
                ))
                break

        # 6. Risky Attachment Extensions
        dangerous_extensions = {".exe", ".scr", ".vbs", ".bat", ".cmd", ".iso", ".img", ".hta", ".js", ".wsf"}
        for att in extracted_attachments:
            att_lower = att.lower()
            if any(att_lower.endswith(ext) for ext in dangerous_extensions) or att_lower.count(".") > 1 and ".pdf." in att_lower:
                findings.append(FindingCreate(
                    category="Phishing",
                    severity="Critical",
                    title=f"High-Risk Executable or Double-Extension Attachment ({att})",
                    evidence=f"Attachment filename: {att}",
                    explanation="The email contains an attachment with an executable extension or spoofed double extension, which can execute malicious payloads or trojans upon opening.",
                    recommendation="Do NOT download, open, or extract this file. Submit it to a sandboxed malware scanner if required by IT security policy.",
                    confidence=0.99,
                    source="SANS Malware Analysis Institute",
                    clause_or_check_type="dangerous_attachment"
                ))

        # Calculate Phishing Score (0 - 100)
        score = 10
        for f in findings:
            if f.severity == "Critical":
                score += 35
            elif f.severity == "High":
                score += 25
            elif f.severity == "Medium":
                score += 12
            elif f.severity == "Low":
                score += 5

        score = min(score, 99) if findings else 8

        if score >= 80:
            risk_level = "Critical"
        elif score >= 60:
            risk_level = "High"
        elif score >= 35:
            risk_level = "Medium"
        elif score >= 15:
            risk_level = "Low"
        else:
            risk_level = "Safe"

        summary = (
            f"Email Phishing Analysis completed. "
            f"Flagged {len(findings)} risk indicator{'s' if len(findings) != 1 else ''}. "
            f"Overall threat assessment: {risk_level} concern ({score}/100). "
            "Never open suspicious email links or download unverified attachments."
        )

        return {
            "overall_risk_score": score,
            "risk_level": risk_level,
            "summary": summary,
            "findings": findings,
            "metadata": {
                "sender": sender,
                "reply_to": reply_to,
                "subject": subject,
                "urls_count": len(extracted_urls),
                "attachments": extracted_attachments,
                "inspected_urls": [u["url"] for u in extracted_urls[:10]]
            }
        }
