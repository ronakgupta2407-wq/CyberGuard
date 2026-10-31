# CyberGuard — AI-Powered Digital, Legal & Privacy Risk Detection Platform

> A full-stack security & compliance platform combining deterministic security checks with AI-assisted interpretation. Audit website infrastructure, extract deceptive Terms & Conditions clauses, detect phishing vectors in emails, and evaluate privacy policies against GDPR, CCPA, and India's DPDP Act 2023.

---

## 🛡️ Six Core Modules

1. **AI Terms & Conditions Analyzer (Module 01)**
   - Paste policy text or upload documents (`.pdf`, `.docx`, `.txt`).
   - Identifies unilateral modifications, indefinite data retention, data monetization/selling, mandatory binding arbitration & class action waivers, broad IP licenses, and auto-renewals.
   - Translates dense legal boilerplate into plain English explanations with actionable user recommendations.
   - Distinguishes potential concerns from automatic legal violations.

2. **Email Phishing & Threat Analyzer (Module 02)**
   - Analyzes sender identities, `Reply-To` / `Return-Path` mismatches, and VIP/brand display name spoofing.
   - Inspects hyperlinks safely without fetching untrusted URLs (detects deceptive anchor text discrepancies, raw IP targets, risky TLDs, and URL shorteners).
   - Detects artificial urgency triggers and credential harvesting demands.
   - Supports raw email paste or direct RFC 822 `.eml` file uploads.

3. **Website Security & SSL/TLS Checker (Module 03)**
   - **SSRF Protection:** Enforces strict domain resolution checks, blocking loopback (`127.0.0.1`), RFC 1918 private subnets, link-local metadata addresses, and IPv6 private addresses.
   - TLS certificate inspection: validity period, days remaining, SAN hostname matching, cipher suite, and TLS version.
   - HTTP security header analysis: `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `X-Frame-Options`, `X-Content-Type-Options`, and cookie security flags (`Secure`, `HttpOnly`, `SameSite`).
   - Technical status report: Passed, Failed, Warning, or Could Not Be Completed.

4. **Privacy Compliance Checker (Module 04)**
   - Evaluates policy statements against versioned legal checklists under:
     - **GDPR** (EU Regulation 2016/679): Lawful basis, Right to access, Right to erasure (Art. 17), DPO contact, international transfers.
     - **CCPA / CPRA** (California Consumer Privacy Act): Notice at collection, "Do Not Sell/Share", Right to delete, Non-discrimination.
     - **India DPDP Act 2023**: Plain language notice (Sec. 5), Consent withdrawal manager, Indian Grievance Redressal Officer (Sec. 13), Protection of children's data (Sec. 9).
   - Categorizes statutory requirements as **Supported**, **Potentially Missing**, **Conflicting**, or **Inconclusive** with legal citations.

5. **Unified Risk Dashboard (Module 05)**
   - Multi-vector risk audit consolidating website, legal terms, and email artifacts into a weighted composite score (0 - 100).
   - Aggregated findings across categories: Privacy, Phishing, Website Security, and Legal Compliance.

6. **Reports, History & Comparison (Module 06)**
   - SQLite persistence of all past scans, metadata, and findings.
   - **Forensic PDF Export:** Professional multi-page PDF risk reports generated via **ReportLab**.
   - **Plain-language summary:** Results, dashboard, and PDF reports show a concise risk overview plus prioritized findings with evidence, impact, and recommended actions.
   - **Side-by-Side Comparison:** Compare two scans side-by-side to track security progression, new risks, and resolved items.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast, responsive modern web interface |
| **Styling** | Tailwind CSS v4 | Cyberpunk dark theme with glowing badges |
| **Backend** | Python 3.12 + FastAPI | High-performance asynchronous REST API |
| **Data Validation** | Pydantic v2 | Strict schema validation |
| **Database** | SQLite locally; PostgreSQL in deployment + SQLAlchemy 2.0 | Persistent scans, findings, and compliance matrix |
| **Document Processing** | `pypdf`, `python-docx` | Text extraction from PDF and Word documents |
| **Website & Network** | `ssl`, `socket`, `httpx`, `ipaddress` | TLS validation, HTTP headers, SSRF prevention |
| **Report Export** | ReportLab | Professional downloadable PDF reports |
| **Authentication** | Firebase Auth (Google Sign-In) | Identity and authentication with guest demo fallback |
| **Testing** | Pytest + FastAPI TestClient | 100% passing automated test suite |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Navigate to project root
cd CyberGuard

# Activate Python virtual environment
.\venv\Scripts\activate   # On Windows
# or: source venv/bin/activate on Linux/macOS

# Run Pytest test suite
$env:PYTHONPATH="backend"
pytest backend/tests -v

# Start the FastAPI server
python backend/run.py
```
The backend API will be live at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

Open the local app at `http://localhost:5173`. For deployment, serve the frontend over HTTPS.

### 3. Frontend Setup
In a new terminal window:
```bash
cd CyberGuard/frontend

# Install dependencies (already prepared)
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Deploy to Render and Vercel

The repository includes a Render Blueprint at `render.yaml` for the FastAPI service and PostgreSQL database, and a Vercel rewrite at `frontend/vercel.json` that forwards `/api/*` requests to `https://cyberguard-api.onrender.com`.

1. Push the repository to GitHub.
2. In Render, choose **New → Blueprint**, select this repository, and apply `render.yaml`. The Blueprint creates `cyberguard-api` and `cyberguard-db`. Set `GROQ_API_KEY` in the Render dashboard; do not put API keys in Git.
3. Wait for the Render service to deploy. Its service URL must remain `https://cyberguard-api.onrender.com` to match the Vercel rewrite.
4. In Vercel, import the same GitHub repository and set **Root Directory** to `frontend`. Use the Vite defaults: build command `npm run build`, output directory `dist`. The checked-in `vercel.json` routes API requests to Render.
5. Add the deployed Vercel domain to the Google OAuth client's **Authorized JavaScript origins**, then redeploy or refresh the Vercel deployment if its build settings change.
6. Smoke-test the deployed site, Google sign-in, analysis endpoints, scan history, and PDF export.

The included Render Blueprint uses free plans for a no-cost demo. Free services can sleep, and free PostgreSQL storage is temporary and subject to provider limits; do not use it for important production data. For production, select an always-on web-service plan and a paid PostgreSQL plan with backups/retention. Keep `DATABASE_URL` set from Render's database connection string and keep provider credentials in Render's environment settings.

---

## 🧪 Running Automated Tests

Run the test suite verifying SSRF blocking, phishing detection, T&C extraction, GDPR/DPDP compliance checking, and ReportLab PDF generation:
```bash
$env:PYTHONPATH="backend"
.\venv\Scripts\python -m pytest backend/tests -v
```

---

## ⚖️ Legal & Security Notice
CyberGuard is designed for educational, research, and technical auditing purposes. Automated text analysis flags potential documentation gaps rather than definitive statutory breaches. Consult legal counsel for formal compliance certification and certified security engineers for penetration testing.
