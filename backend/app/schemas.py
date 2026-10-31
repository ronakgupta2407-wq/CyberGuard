from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class FindingBase(BaseModel):
    category: str = Field(..., description="Privacy, Phishing, Website Security, or Legal Compliance")
    severity: str = Field(..., description="Informational, Low, Medium, High, or Critical")
    title: str = Field(..., description="Brief title of finding")
    evidence: str = Field(..., description="Specific clause, email excerpt, or technical check")
    explanation: str = Field(..., description="Why this finding matters")
    recommendation: str = Field(..., description="Next steps and mitigation advice")
    confidence: float = Field(0.85, description="Confidence estimate (0.0 to 1.0)")
    source: str = Field("", description="Supporting technical/legal standard or heuristic rule")
    clause_or_check_type: Optional[str] = Field("", description="Classifier tag")

class FindingCreate(FindingBase):
    pass

class FindingResponse(FindingBase):
    id: str
    scan_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ComplianceItemBase(BaseModel):
    framework: str = Field(..., description="GDPR, CCPA, or DPDP")
    requirement_id: str
    requirement_title: str
    status: str = Field(..., description="Supported, Potentially Missing, Conflicting, or Inconclusive")
    citation: str = Field("", description="Legal article or section reference")
    evidence: str = Field("", description="Policy passage supporting status")
    notes: str = Field("", description="Analysis nuances or legal limitations")

class ComplianceItemResponse(ComplianceItemBase):
    id: str
    scan_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ScanResponse(BaseModel):
    id: str
    user_id: str
    module_type: str
    target: str
    overall_risk_score: int
    risk_level: str
    summary: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    findings: List[FindingResponse] = []
    compliance_items: List[ComplianceItemResponse] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class KeyFindingResponse(BaseModel):
    category: str = ""
    severity: str
    title: str
    evidence: str = ""
    explanation: str = ""
    recommendation: str = ""

class ScanSummaryResponse(BaseModel):
    id: str
    user_id: str
    module_type: str
    target: str
    overall_risk_score: int
    risk_level: str
    summary: str
    created_at: datetime
    finding_count: int = 0
    finding_counts: Dict[str, int] = Field(default_factory=dict)
    key_findings: List[KeyFindingResponse] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

# Module Request / Response schemas

class TCAnalyzeRequest(BaseModel):
    text: Optional[str] = None
    title: Optional[str] = "Terms & Privacy Policy Analysis"
    llm_provider: Optional[str] = "heuristic" # "gemini", "openai", "heuristic"
    user_api_key: Optional[str] = None

class PhishingAnalyzeRequest(BaseModel):
    raw_email: Optional[str] = None
    sender: Optional[str] = None
    reply_to: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    llm_provider: Optional[str] = "heuristic"
    user_api_key: Optional[str] = None

class WebsiteCheckRequest(BaseModel):
    url: str = Field(..., description="URL or hostname to inspect")

class ComplianceCheckRequest(BaseModel):
    text: str = Field(..., description="Policy or terms text")
    frameworks: List[str] = Field(default=["GDPR", "CCPA", "DPDP"], description="Frameworks to check")
    title: Optional[str] = "Privacy Compliance Audit"
    llm_provider: Optional[str] = "heuristic"
    user_api_key: Optional[str] = None

class UnifiedRiskRequest(BaseModel):
    url: Optional[str] = None
    policy_text: Optional[str] = None
    email_text: Optional[str] = None
    title: Optional[str] = "Unified Security & Privacy Audit"
    llm_provider: Optional[str] = "heuristic"
    user_api_key: Optional[str] = None

class ScanCompareRequest(BaseModel):
    scan_id_1: str
    scan_id_2: str

class ScanCompareResponse(BaseModel):
    scan_1: ScanResponse
    scan_2: ScanResponse
    score_difference: int
    new_findings: List[FindingResponse]
    resolved_findings: List[FindingResponse]
    common_findings: List[FindingResponse]
    comparison_summary: str
