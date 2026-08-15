from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from dotenv import load_dotenv
from openai import OpenAI

import io
import os


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not configured.")


client = OpenAI(api_key=OPENAI_API_KEY)


# ==========================================
# CYBERGUARD API
# ==========================================

app = FastAPI(
    title="CyberGuard API",
    description="AI-powered Terms of Service Analyzer",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():
    return {
        "message": "CyberGuard API is running",
        "status": "online"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# ==========================================
# PDF + OPENAI ANALYSIS
# ==========================================

@app.post("/api/analyze/pdf")
async def analyze_pdf(file: UploadFile = File(...)):

    # Check file type
    if file.content_type != "application/pdf":
        return {
            "success": False,
            "message": "Only PDF files are supported."
        }

    # Read PDF
    contents = await file.read()

    pdf = PdfReader(io.BytesIO(contents))

    # Extract text
    extracted_text = ""

    for page in pdf.pages:

        text = page.extract_text()

        if text:
            extracted_text += text + "\n"


    # Make sure text exists
    if not extracted_text.strip():
        return {
            "success": False,
            "message": "Could not extract text from this PDF."
        }


    # ==========================================
    # OPENAI PROMPT
    # ==========================================

    prompt = f"""
You are CyberGuard, an AI-powered Terms of Service
security and privacy analyzer.

Analyze the following Terms of Service document.

Provide:

1. A simple plain-English summary.
2. Overall risk score from 0 to 100.
3. Identify potentially risky clauses.
4. Explain why each risky clause matters.
5. Identify privacy and data-sharing concerns.
6. Identify user rights and restrictions.
7. Identify cancellation or termination concerns.
8. Identify arbitration or legal concerns.
9. Identify unusual or unfair terms.
10. Give practical recommendations to the user.

Do not provide legal advice.
Clearly state that this is an AI-generated analysis
and not a substitute for professional legal advice.

Terms of Service:

{extracted_text}
"""


    # ==========================================
    # CALL OPENAI
    # ==========================================

    response = client.responses.create(
        model="gpt-5.6",
        input=prompt
    )


    analysis = response.output_text


    # ==========================================
    # RESPONSE
    # ==========================================

    return {
        "success": True,
        "filename": file.filename,
        "pages": len(pdf.pages),
        "characters": len(extracted_text),
        "analysis": analysis
    }