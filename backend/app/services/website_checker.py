import socket
import ssl
import ipaddress
import urllib.parse
from datetime import datetime
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings
from app.schemas import FindingCreate

class WebsiteChecker:
    @staticmethod
    def is_private_or_restricted_ip(ip_str: str) -> bool:
        """Verify whether an IP is loopback, private, link-local, or restricted to avoid SSRF."""
        try:
            ip = ipaddress.ip_address(ip_str)
            if ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
                return True
            for cidr in settings.BLOCKED_IP_RANGES:
                if "/" in cidr and ip in ipaddress.ip_network(cidr):
                    return True
            return False
        except ValueError:
            return True

    @classmethod
    def sanitize_and_resolve(cls, target_url: str) -> Dict[str, Any]:
        """Validate URL scheme and resolve target IP safely."""
        raw_url = target_url.strip()
        if not raw_url.startswith("http://") and not raw_url.startswith("https://"):
            raw_url = "https://" + raw_url

        parsed = urllib.parse.urlparse(raw_url)
        hostname = parsed.hostname
        if not hostname:
            raise ValueError("Invalid hostname or URL format.")

        # Resolve hostname
        try:
            addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
            resolved_ips = list(set([item[4][0] for item in addr_info]))
        except socket.gaierror as e:
            raise ValueError(f"DNS resolution failed for hostname '{hostname}': {str(e)}")

        for ip in resolved_ips:
            if cls.is_private_or_restricted_ip(ip):
                raise PermissionError(f"SSRF Protection: Hostname '{hostname}' resolves to restricted IP address ({ip}). Connection aborted.")

        return {
            "url": raw_url,
            "hostname": hostname,
            "resolved_ip": resolved_ips[0] if resolved_ips else "Unknown",
            "all_ips": resolved_ips
        }

    @staticmethod
    def inspect_tls(hostname: str, port: int = 443) -> Dict[str, Any]:
        """Retrieve and validate SSL/TLS certificate details."""
        context = ssl.create_default_context()
        context.check_hostname = True
        context.verify_mode = ssl.CERT_REQUIRED

        try:
            with socket.create_connection((hostname, port), timeout=5.0) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    tls_version = ssock.version()

                    not_after_str = cert.get("notAfter", "")
                    not_before_str = cert.get("notBefore", "")

                    # Format date: 'May  5 12:00:00 2026 GMT'
                    expiry_date = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
                    start_date = datetime.strptime(not_before_str, "%b %d %H:%M:%S %Y %Z")
                    now = datetime.utcnow()
                    days_remaining = (expiry_date - now).days

                    # Extract Subject Alternative Names
                    san_list = [entry[1] for entry in cert.get("subjectAltName", []) if entry[0] == "DNS"]

                    # Extract Issuer
                    issuer_dict = dict(x[0] for x in cert.get("issuer", ()))
                    issuer_org = issuer_dict.get("organizationName", issuer_dict.get("commonName", "Unknown Issuer"))

                    return {
                        "status": "passed",
                        "tls_version": tls_version,
                        "cipher": cipher[0] if cipher else "Unknown",
                        "issuer": issuer_org,
                        "valid_from": start_date.isoformat(),
                        "valid_until": expiry_date.isoformat(),
                        "days_remaining": days_remaining,
                        "san_list": san_list[:10],
                        "is_expired": days_remaining <= 0
                    }
        except ssl.SSLCertVerificationError as e:
            return {
                "status": "failed",
                "error": f"TLS Certificate Verification Error: {e.verify_message or str(e)}",
                "is_expired": "certificate has expired" in str(e).lower()
            }
        except Exception as e:
            return {
                "status": "could_not_complete",
                "error": f"Could not establish TLS connection on port {port}: {str(e)}"
            }

    @classmethod
    async def inspect_website(cls, target_url: str) -> Dict[str, Any]:
        """Run complete website security audit with technical checks and standardized findings."""
        target_info = cls.sanitize_and_resolve(target_url)
        hostname = target_info["hostname"]
        resolved_ip = target_info["resolved_ip"]

        checks_results = []
        findings: List[FindingCreate] = []

        # 1. TLS Certificate Inspection
        tls_info = cls.inspect_tls(hostname)
        if tls_info.get("status") == "passed":
            days = tls_info.get("days_remaining", 0)
            if days < 15:
                checks_results.append({
                    "name": "TLS Certificate Validity",
                    "status": "Warning",
                    "details": f"Certificate is valid but expires soon ({days} days remaining)."
                })
                findings.append(FindingCreate(
                    category="Website Security",
                    severity="Medium",
                    title="TLS Certificate Expiring Soon",
                    evidence=f"Expires in {days} days on {tls_info.get('valid_until')}",
                    explanation="An expiring TLS certificate risks service outage and catastrophic browser warning screens for visitors once expired.",
                    recommendation="Renew the TLS certificate immediately using automated ACME / Let's Encrypt tooling.",
                    confidence=1.0,
                    source="RFC 5280 Internet X.509 Public Key Infrastructure",
                    clause_or_check_type="tls_expiring"
                ))
            else:
                checks_results.append({
                    "name": "TLS Certificate Validity",
                    "status": "Passed",
                    "details": f"Valid certificate issued by {tls_info.get('issuer')}. {days} days remaining. Version: {tls_info.get('tls_version')}."
                })
        elif tls_info.get("status") == "failed":
            checks_results.append({
                "name": "TLS Certificate Validity",
                "status": "Failed",
                "details": tls_info.get("error", "Certificate invalid")
            })
            findings.append(FindingCreate(
                category="Website Security",
                severity="Critical",
                title="Invalid or Expired TLS Certificate",
                evidence=tls_info.get("error", "TLS verification failed"),
                explanation="The website fails TLS verification. Browsers will display high-risk warning interstitials and intercept traffic.",
                recommendation="Replace the invalid or expired certificate with a trusted CA-signed certificate.",
                confidence=1.0,
                source="RFC 5280 Internet X.509 Public Key Infrastructure",
                clause_or_check_type="tls_invalid"
            ))
        else:
            checks_results.append({
                "name": "TLS Certificate Validity",
                "status": "Could Not Be Completed",
                "details": tls_info.get("error", "TLS check failed")
            })

        # 2. HTTP Security Headers and HTTPS Redirection Inspection
        headers_response = None
        http_redirected_to_https = False
        
        # Test HTTP to HTTPS redirection
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=False, verify=False) as client:
            try:
                http_res = await client.get(f"http://{hostname}")
                if http_res.is_redirect and "https://" in http_res.headers.get("location", ""):
                    http_redirected_to_https = True
            except Exception:
                pass

        if http_redirected_to_https:
            checks_results.append({
                "name": "HTTPS Redirection Enforcement",
                "status": "Passed",
                "details": "Plaintext HTTP requests automatically redirect to secure HTTPS."
            })
        else:
            checks_results.append({
                "name": "HTTPS Redirection Enforcement",
                "status": "Warning",
                "details": "HTTP to HTTPS redirection was not detected or failed to redirect."
            })
            findings.append(FindingCreate(
                category="Website Security",
                severity="Low",
                title="Missing Automatic HTTPS Redirection",
                evidence=f"http://{hostname} does not redirect directly to https://",
                explanation="Without automatic HTTPS redirection, users who type the domain without a scheme might communicate over unencrypted HTTP, vulnerable to man-in-the-middle eavesdropping.",
                recommendation="Configure your web server (Nginx/Apache/Cloudflare) with a permanent 301 redirect from HTTP to HTTPS.",
                confidence=0.85,
                source="OWASP Transport Layer Protection Cheat Sheet",
                clause_or_check_type="https_redirection"
            ))

        # Test HTTPS endpoint and inspect headers
        try:
            async with httpx.AsyncClient(timeout=7.0, follow_redirects=True, verify=False) as client:
                res = await client.get(f"https://{hostname}")
                headers = res.headers

                # A. Strict-Transport-Security (HSTS)
                hsts = headers.get("strict-transport-security")
                if hsts:
                    checks_results.append({
                        "name": "Strict-Transport-Security (HSTS)",
                        "status": "Passed",
                        "details": f"Present ({hsts})"
                    })
                else:
                    checks_results.append({
                        "name": "Strict-Transport-Security (HSTS)",
                        "status": "Failed",
                        "details": "Missing header. Site is susceptible to SSL-stripping attacks."
                    })
                    findings.append(FindingCreate(
                        category="Website Security",
                        severity="Medium",
                        title="Missing Strict-Transport-Security (HSTS) Header",
                        evidence="Header 'Strict-Transport-Security' not returned by server",
                        explanation="HSTS forces compliant browsers to interact exclusively over HTTPS, preventing SSL stripping and protocol downgrade attacks.",
                        recommendation="Add header 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' to all HTTPS responses.",
                        confidence=1.0,
                        source="RFC 6797 HTTP Strict Transport Security",
                        clause_or_check_type="hsts_missing"
                    ))

                # B. Content-Security-Policy (CSP)
                csp = headers.get("content-security-policy")
                if csp:
                    checks_results.append({
                        "name": "Content-Security-Policy (CSP)",
                        "status": "Passed",
                        "details": "Configured to mitigate cross-site scripting (XSS) and data injection."
                    })
                else:
                    checks_results.append({
                        "name": "Content-Security-Policy (CSP)",
                        "status": "Failed",
                        "details": "Header absent. Increased exposure to cross-site scripting (XSS)."
                    })
                    findings.append(FindingCreate(
                        category="Website Security",
                        severity="Medium",
                        title="Missing Content-Security-Policy (CSP) Header",
                        evidence="Header 'Content-Security-Policy' not returned",
                        explanation="A Content Security Policy restricts the sources from which scripts, styles, and media can load, providing vital defense-in-depth against XSS attacks.",
                        recommendation="Define and deploy a strict CSP header disallowing untrusted third-party scripts.",
                        confidence=1.0,
                        source="W3C Content Security Policy Level 3",
                        clause_or_check_type="csp_missing"
                    ))

                # C. X-Frame-Options (Clickjacking)
                xfo = headers.get("x-frame-options")
                if xfo and xfo.upper() in ["DENY", "SAMEORIGIN"]:
                    checks_results.append({
                        "name": "X-Frame-Options",
                        "status": "Passed",
                        "details": f"Configured ({xfo}) to prevent Clickjacking."
                    })
                else:
                    checks_results.append({
                        "name": "X-Frame-Options",
                        "status": "Failed",
                        "details": "Missing or permissive. Potential Clickjacking vulnerability."
                    })
                    findings.append(FindingCreate(
                        category="Website Security",
                        severity="Low",
                        title="Missing or Weak X-Frame-Options Header",
                        evidence=f"Header 'X-Frame-Options' is '{xfo}'",
                        explanation="Without X-Frame-Options (or CSP frame-ancestors), malicious websites can render your application within hidden iframes to orchestrate clickjacking attacks.",
                        recommendation="Set 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN'.",
                        confidence=0.95,
                        source="RFC 7034 HTTP Header Field X-Frame-Options",
                        clause_or_check_type="xfo_missing"
                    ))

                # D. X-Content-Type-Options
                xcto = headers.get("x-content-type-options")
                if xcto and "nosniff" in xcto.lower():
                    checks_results.append({
                        "name": "X-Content-Type-Options",
                        "status": "Passed",
                        "details": "nosniff is configured."
                    })
                else:
                    checks_results.append({
                        "name": "X-Content-Type-Options",
                        "status": "Failed",
                        "details": "Missing nosniff attribute. Browsers may perform MIME-type sniffing."
                    })
                    findings.append(FindingCreate(
                        category="Website Security",
                        severity="Low",
                        title="Missing X-Content-Type-Options Header",
                        evidence="Header 'X-Content-Type-Options: nosniff' not detected",
                        explanation="MIME sniffing allows browsers to interpret files differently from declared content types, enabling script execution disguised as text or images.",
                        recommendation="Configure your web server to return 'X-Content-Type-Options: nosniff'.",
                        confidence=1.0,
                        source="OWASP Secure Headers Guide",
                        clause_or_check_type="xcto_missing"
                    ))

                # E. Server Version Disclosure
                server_hdr = headers.get("server") or headers.get("x-powered-by")
                if server_hdr and any(c.isdigit() for c in server_hdr):
                    checks_results.append({
                        "name": "Server Fingerprint Obfuscation",
                        "status": "Warning",
                        "details": f"Server banner exposes software version: '{server_hdr}'"
                    })
                    findings.append(FindingCreate(
                        category="Website Security",
                        severity="Low",
                        title="Detailed Server Banner & Technology Disclosure",
                        evidence=f"Server Header: '{server_hdr}'",
                        explanation="Broadcasting precise web server versions assists adversaries in mapping targeted exploits and CVEs against known software vulnerabilities.",
                        recommendation="Disable detailed server signatures (e.g. ServerTokens Prod in Apache or server_tokens off in Nginx).",
                        confidence=0.90,
                        source="CWE-200 Information Exposure",
                        clause_or_check_type="server_disclosure"
                    ))
                else:
                    checks_results.append({
                        "name": "Server Fingerprint Obfuscation",
                        "status": "Passed",
                        "details": "Detailed server version banners are hidden."
                    })

                # F. Cookie Security Attributes
                cookies = res.cookies
                insecure_cookies = []
                for cookie_name, cookie_val in cookies.items():
                    # Check Set-Cookie headers in response
                    raw_cookie_headers = res.headers.get_list("set-cookie") if hasattr(res.headers, "get_list") else [res.headers.get("set-cookie", "")]
                    for raw_c in raw_cookie_headers:
                        if cookie_name in raw_c:
                            flags = []
                            if "secure" not in raw_c.lower():
                                flags.append("Missing Secure")
                            if "httponly" not in raw_c.lower():
                                flags.append("Missing HttpOnly")
                            if "samesite" not in raw_c.lower():
                                flags.append("Missing SameSite")
                            if flags:
                                insecure_cookies.append(f"{cookie_name} ({', '.join(flags)})")

                if insecure_cookies:
                    checks_results.append({
                        "name": "Cookie Security Flags",
                        "status": "Warning",
                        "details": f"Cookies lacking secure flags: {'; '.join(insecure_cookies[:3])}"
                    })
                    findings.append(FindingCreate(
                        category="Website Security",
                        severity="Low",
                        title="Insecure Cookie Attributes Detected",
                        evidence=f"Cookies: {'; '.join(insecure_cookies[:3])}",
                        explanation="Cookies lacking Secure, HttpOnly, or SameSite flags are vulnerable to cross-site scripting token theft and transmission over insecure channels.",
                        recommendation="Set Secure, HttpOnly, and SameSite=Lax (or Strict) on all session cookies.",
                        confidence=0.90,
                        source="OWASP Cookie Security Guide",
                        clause_or_check_type="cookie_flags"
                    ))
                else:
                    checks_results.append({
                        "name": "Cookie Security Flags",
                        "status": "Passed",
                        "details": "All set cookies carry appropriate security flags or none set."
                    })

        except Exception as e:
            checks_results.append({
                "name": "HTTPS Headers Inspection",
                "status": "Could Not Be Completed",
                "details": f"Connection error: {str(e)}"
            })

        # Calculate Website Security Score (0-100)
        score = 15
        for f in findings:
            if f.severity == "Critical":
                score += 35
            elif f.severity == "High":
                score += 20
            elif f.severity == "Medium":
                score += 12
            elif f.severity == "Low":
                score += 5

        score = min(score, 99) if findings else 10

        if score >= 70:
            risk_level = "High"
        elif score >= 45:
            risk_level = "Medium"
        elif score >= 20:
            risk_level = "Low"
        else:
            risk_level = "Safe"

        summary = (
            f"Website security audit completed for {hostname} ({resolved_ip}). "
            f"Evaluated {len(checks_results)} core indicators resulting in {len(findings)} security finding{'s' if len(findings) != 1 else ''}. "
            f"Risk Level: {risk_level} ({score}/100). "
            "Important: HTTPS encryption alone does not prove a site is trustworthy; operational hygiene and transport headers are required."
        )

        return {
            "overall_risk_score": score,
            "risk_level": risk_level,
            "summary": summary,
            "findings": findings,
            "metadata": {
                "target_url": target_url,
                "hostname": hostname,
                "resolved_ip": resolved_ip,
                "tls_info": tls_info,
                "technical_checks": checks_results
            }
        }
