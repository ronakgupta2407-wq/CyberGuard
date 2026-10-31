import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AppState(Base):
    __tablename__ = "app_state"

    key = Column(String(64), primary_key=True)
    value = Column(String(255), nullable=False)

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(128), default="guest", index=True)
    module_type = Column(String(32), index=True) # tc, phishing, website, compliance, unified
    target = Column(String(512), default="") # URL, document name, email subject
    overall_risk_score = Column(Integer, default=0) # 0 to 100
    risk_level = Column(String(32), default="Low") # Safe, Low, Medium, High, Critical
    summary = Column(Text, default="")
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    compliance_items = relationship("ComplianceItem", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), index=True)
    category = Column(String(64), index=True) # Privacy, Phishing, Website Security, Legal Compliance
    severity = Column(String(32), index=True) # Informational, Low, Medium, High, Critical
    title = Column(String(256), default="")
    evidence = Column(Text, default="")
    explanation = Column(Text, default="")
    recommendation = Column(Text, default="")
    confidence = Column(Float, default=0.85)
    source = Column(String(256), default="")
    clause_or_check_type = Column(String(64), default="")

    scan = relationship("Scan", back_populates="findings")

class ComplianceItem(Base):
    __tablename__ = "compliance_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), index=True)
    framework = Column(String(32), index=True) # GDPR, CCPA, DPDP
    requirement_id = Column(String(64)) # e.g. GDPR-01
    requirement_title = Column(String(256))
    status = Column(String(32)) # Supported, Potentially Missing, Conflicting, Inconclusive
    citation = Column(String(256), default="")
    evidence = Column(Text, default="")
    notes = Column(Text, default="")

    scan = relationship("Scan", back_populates="compliance_items")
