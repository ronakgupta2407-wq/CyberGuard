import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import AppState, Scan, Finding, ComplianceItem
from app.routes import tc, phishing, website, compliance, unified, scans, auth_routes


# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("cyberguard")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI-Powered Digital, Legal, and Privacy Risk Detection Platform"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(tc.router, prefix=settings.API_V1_STR)
app.include_router(phishing.router, prefix=settings.API_V1_STR)
app.include_router(website.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(unified.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "ai_provider": "groq" if settings.GROQ_API_KEY else "heuristic_fallback",
        "ai_available": bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY),
    }

# Initial seed data for demo & testing if database is fresh
def seed_demo_data():
    db = SessionLocal()
    try:
        seed_marker = db.query(AppState).filter(AppState.key == "demo_data_seeded").first()
        if db.query(Scan).count() == 0 and seed_marker is None:
            logger.info("Database empty, populating initial sample scans...")

            # 1. Sample T&C Scan
            s1 = Scan(
                user_id="guest",
                module_type="tc",
                target="OmniSocial App Terms of Service v2.4",
                overall_risk_score=78,
                risk_level="High",
                summary="Evaluated OmniSocial policy text. Identified 4 high-priority clause concerns regarding continuous tracking, mandatory arbitration, and unilateral terms changes without prior notice."
            )
            db.add(s1)
            db.flush()

            f1 = Finding(
                scan_id=s1.id,
                category="Legal Compliance",
                severity="High",
                title="Mandatory Binding Arbitration & Class Action Waiver",
                evidence="All claims and disputes must be resolved solely through binding individual arbitration under AAA rules. You expressly waive your right to a trial by jury or to participate in any class action lawsuit.",
                explanation="You surrender the constitutional right to take corporate disputes to public court or join aggregated class proceedings.",
                recommendation="Review if an arbitration opt-out letter within 30 days is permitted under clause 14.2.",
                confidence=0.95,
                source="Civil Rights Due Process & Judicial Standards"
            )
            f2 = Finding(
                scan_id=s1.id,
                category="Privacy",
                severity="High",
                title="Third-Party Data Monetization & Behavioral Sharing",
                evidence="We reserve the right to share, transfer, and monetize your browsing habits and personal information with commercial partners and advertising brokers.",
                explanation="Your usage and profile habits are monetized across third-party networks for targeted behavioral advertising.",
                recommendation="Exercise an explicit opt-out via privacy settings or CCPA / GDPR data objection request.",
                confidence=0.92,
                source="CCPA § 1798.120 Opt-Out Mandates"
            )
            f3 = Finding(
                scan_id=s1.id,
                category="Legal Compliance",
                severity="Medium",
                title="Unilateral Contract Changes Without Prior Notice",
                evidence="We may modify these terms at any time without prior notice at our sole discretion. Continued use constitutes acceptance.",
                explanation="The service provider can alter user obligations or pricing retroactively without requiring affirmative confirmation.",
                recommendation="Monitor company changelogs regularly for unannounced policy modifications.",
                confidence=0.88,
                source="Consumer Fairness Guidelines"
            )
            db.add_all([f1, f2, f3])

            # 2. Sample Phishing Scan
            s2 = Scan(
                user_id="guest",
                module_type="phishing",
                target="Urgent: Your PayPal Account Has Been Limited (#TX-9941)",
                overall_risk_score=92,
                risk_level="Critical",
                summary="Email Phishing Analysis flagged 4 critical indicators including display name spoofing, deceptive anchor link to suspicious TLD, and 24-hour account suspension coercion."
            )
            db.add(s2)
            db.flush()

            pf1 = Finding(
                scan_id=s2.id,
                category="Phishing",
                severity="Critical",
                title="Deceptive Hyperlink Destination Discrepancy",
                evidence="Displayed Link Text: 'https://paypal.com/security-center' -> Actual Target URL: 'http://paypal-verification-portal.xyz/login.php'",
                explanation="The visible link text portrays a legitimate PayPal domain, but the actual hyperlink routes user traffic to a phishing portal registered under .xyz.",
                recommendation="Do not click. Never authenticate or type credentials into domains that do not end in .paypal.com.",
                confidence=0.99,
                source="APWG Anti-Phishing Guidelines"
            )
            pf2 = Finding(
                scan_id=s2.id,
                category="Phishing",
                severity="High",
                title="Brand Impersonation in Sender Display Name",
                evidence="From: 'PayPal Resolution Center' <support-desk@mailer-security-update.top>",
                explanation="The sender uses PayPal's branding in the display name, but the underlying sending domain belongs to an unrelated top-level domain.",
                recommendation="Mark message as spam/phishing immediately and notify your security team.",
                confidence=0.96,
                source="NIST SP 800-177 Trustworthy Email Guidelines"
            )
            pf3 = Finding(
                scan_id=s2.id,
                category="Phishing",
                severity="Medium",
                title="Artificial Urgency & Coercive Deadline Tactics",
                evidence="Detected trigger: 'Your account will be permanently deactivated within 24 hours unless you verify identity'",
                explanation="Attackers employ artificial time pressure to incite hasty actions without due verification.",
                recommendation="Verify directly by logging in through PayPal's official app or browser bookmark.",
                confidence=0.90,
                source="Social Engineering Defense Principles"
            )
            db.add_all([pf1, pf2, pf3])

            # 3. Sample Website Security Scan
            s3 = Scan(
                user_id="guest",
                module_type="website",
                target="https://legacy-banking-demo.net",
                overall_risk_score=52,
                risk_level="Medium",
                summary="Website security audit completed for legacy-banking-demo.net. Detected missing HSTS and absent Content Security Policy, exposing visitors to potential SSL-stripping and cross-site scripting."
            )
            db.add(s3)
            db.flush()

            wf1 = Finding(
                scan_id=s3.id,
                category="Website Security",
                severity="Medium",
                title="Missing Strict-Transport-Security (HSTS) Header",
                evidence="Header 'Strict-Transport-Security' not returned by server",
                explanation="Without HSTS, the connection can be stripped to unencrypted HTTP by active network adversaries (SSL stripping).",
                recommendation="Deploy header 'Strict-Transport-Security: max-age=31536000; includeSubDomains'.",
                confidence=1.0,
                source="RFC 6797 HTTP Strict Transport Security"
            )
            wf2 = Finding(
                scan_id=s3.id,
                category="Website Security",
                severity="Medium",
                title="Missing Content-Security-Policy (CSP) Header",
                evidence="Header 'Content-Security-Policy' not returned",
                explanation="A CSP header restricts scripts and objects from unauthorized third-party origins, preventing XSS injection.",
                recommendation="Deploy a restrictive Content Security Policy header.",
                confidence=1.0,
                source="W3C Content Security Policy Level 3"
            )
            db.add_all([wf1, wf2])

            db.add(AppState(key="demo_data_seeded", value="true"))
            db.commit()
            logger.info("Sample scans successfully seeded!")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

seed_demo_data()
