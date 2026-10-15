import re
from typing import Dict, Any, List, Optional
from app.schemas import ComplianceItemBase, FindingCreate

class ComplianceChecker:
    FRAMEWORK_CATALOG = {
        "GDPR": [
            {
                "id": "GDPR-01",
                "title": "Lawful Basis for Processing",
                "citation": "GDPR Article 6",
                "patterns": [
                    r"(legal basis|lawful basis|grounds for processing).{0,50}(consent|legitimate interests?|contractual necessity|legal obligation)",
                    r"we process your (data|information) (based on|under) (consent|contractual necessity|legitimate interest)"
                ],
                "conflicting_patterns": [
                    r"we process personal data without any specific legal ground",
                    r"at our sole discretion for any purpose without consent"
                ],
                "description": "Requires controllers to identify and document a valid lawful basis (e.g. consent, legitimate interests) for each processing activity."
            },
            {
                "id": "GDPR-02",
                "title": "Right of Access by Data Subject",
                "citation": "GDPR Article 15",
                "patterns": [
                    r"right to (access|request a copy of|obtain).{0,40}(your personal (data|information)|records)",
                    r"(request|receive) (a copy|confirmation) of (the|your) personal data we hold"
                ],
                "conflicting_patterns": [
                    r"we do not provide copies of personal records",
                    r"access to your personal data is strictly prohibited"
                ],
                "description": "Data subjects have the right to obtain confirmation and a copy of their personal data."
            },
            {
                "id": "GDPR-03",
                "title": "Right to Erasure ('Right to be Forgotten')",
                "citation": "GDPR Article 17",
                "patterns": [
                    r"right to (request )?(erasure|be forgotten|delete|deletion( of)?).{0,50}(your personal (data|information)|account)?",
                    r"request (that we|the) delet(e|ion) (of )?your (personal )?(information|data|profile)",
                    r"('right to be forgotten'|\"right to be forgotten\")"
                ],
                "conflicting_patterns": [
                    r"we (will not|never) delete (user|your) (data|information)",
                    r"all data is retained permanently without right to delete"
                ],
                "description": "Individuals can request the deletion of their personal data without undue delay when grounds apply."
            },
            {
                "id": "GDPR-04",
                "title": "Data Retention Limitation",
                "citation": "GDPR Article 5(1)(e)",
                "patterns": [
                    r"retain (your )?(personal )?data (only )?(for|as long as).{0,50}(necessary to fulfill|purposes set out|for [0-9]+ (months|years|days))",
                    r"retention schedule.{0,40}(deleted after|period of)"
                ],
                "conflicting_patterns": [
                    r"retain (your )?data indefinitely for any future use",
                    r"store personal records perpetually without deletion timelines"
                ],
                "description": "Personal data must not be kept longer than necessary for the stated processing purposes."
            },
            {
                "id": "GDPR-05",
                "title": "Data Protection Officer (DPO) Contact",
                "citation": "GDPR Article 13(1)(a) & Article 37",
                "patterns": [
                    r"(data protection officer|dpo|privacy officer|privacy representative)[\s\S]{0,40}(contact|email|reached at|@)",
                    r"contact our dpo at"
                ],
                "conflicting_patterns": [],
                "description": "Provides data subjects with direct contact details for the organization's Data Protection Officer or EU representative."
            },
            {
                "id": "GDPR-06",
                "title": "International Data Transfers & Safeguards",
                "citation": "GDPR Articles 44-49",
                "patterns": [
                    r"(cross-border|international) (data )?transfers?.{0,50}(standard contractual clauses|sccs|adequacy decision|binding corporate rules)",
                    r"transferred (outside|from) the european economic area.{0,50}(safeguards|sccs)"
                ],
                "conflicting_patterns": [
                    r"transferred internationally without any legal safeguards"
                ],
                "description": "Requires appropriate safeguards (e.g., Standard Contractual Clauses or Adequacy Decisions) when transferring personal data outside the EEA."
            }
        ],
        "CCPA": [
            {
                "id": "CCPA-01",
                "title": "Notice at Collection & Categories Collected",
                "citation": "Cal. Civ. Code § 1798.100",
                "patterns": [
                    r"(categories of personal information|we collect the following categories).{0,50}(identifiers|commercial information|geolocation|internet activity)",
                    r"categories of personal (data|information) (collected|received)"
                ],
                "conflicting_patterns": [],
                "description": "Businesses must inform consumers at or before collection regarding the categories of personal information to be collected."
            },
            {
                "id": "CCPA-02",
                "title": "Right to Opt-Out of Sale or Sharing",
                "citation": "Cal. Civ. Code § 1798.120",
                "patterns": [
                    r"(\"do not sell or share my personal information\"|do not sell my info|opt-out of sale)",
                    r"we do not sell (or share )?your personal (information|data)",
                    r"right to opt[ -]out of the (sale|sharing) of (your )?personal (information|data)"
                ],
                "conflicting_patterns": [
                    r"we sell your personal information and provide no opt-out"
                ],
                "description": "Consumers have the right to direct a business to stop selling or sharing their personal information."
            },
            {
                "id": "CCPA-03",
                "title": "Right to Delete Personal Information",
                "citation": "Cal. Civ. Code § 1798.105",
                "patterns": [
                    r"california (residents|consumers).{0,50}(right to request deletion|request that we delete)",
                    r"right to request that (a|we) delete personal information"
                ],
                "conflicting_patterns": [],
                "description": "Grants California consumers the right to request deletion of personal information collected from them."
            },
            {
                "id": "CCPA-04",
                "title": "Right to Limit Sensitive Personal Information",
                "citation": "Cal. Civ. Code § 1798.121",
                "patterns": [
                    r"(limit the use of (my )?sensitive personal information|sensitive personal data)",
                    r"we do not use sensitive personal information for purposes other than"
                ],
                "conflicting_patterns": [],
                "description": "Consumers can direct businesses to limit the use of their sensitive personal information to strictly necessary services."
            },
            {
                "id": "CCPA-05",
                "title": "Non-Discrimination for Exercising Rights",
                "citation": "Cal. Civ. Code § 1798.125",
                "patterns": [
                    r"(will not|not) discriminate against you for exercising (your )?(privacy )?rights",
                    r"no discrimination.{0,40}(ccpa|cpra|california privacy rights)"
                ],
                "conflicting_patterns": [
                    r"exercising privacy rights will result in account cancellation or fee penalty"
                ],
                "description": "Businesses cannot deny goods, charge differing prices, or provide differing quality of service for exercising CCPA rights."
            }
        ],
        "DPDP": [
            {
                "id": "DPDP-01",
                "title": "Plain Language Notice Before Consent",
                "citation": "DPDP Act 2023 Section 5",
                "patterns": [
                    r"(notice|information) (given|provided).{0,40}(in clear and plain language|prior to obtaining consent)",
                    r"consent request.{0,40}(specified purpose|clear language)"
                ],
                "conflicting_patterns": [],
                "description": "Data Fiduciaries must provide an itemized notice in clear and plain language before obtaining consent."
            },
            {
                "id": "DPDP-02",
                "title": "Right to Withdraw Consent & Consent Manager",
                "citation": "DPDP Act 2023 Section 6(4)",
                "patterns": [
                    r"(withdraw|revoke) (your )?consent.{0,40}(at any time|as easy as giving)",
                    r"consent manager.{0,50}(accessible|manage consent)"
                ],
                "conflicting_patterns": [
                    r"consent once granted is irrevocable under all circumstances"
                ],
                "description": "Data Principals have the right to withdraw consent with ease comparable to giving it, via registered Consent Managers."
            },
            {
                "id": "DPDP-03",
                "title": "Grievance Redressal Mechanism & Officer",
                "citation": "DPDP Act 2023 Section 13",
                "patterns": [
                    r"(grievance officer|grievance redressal|nodal officer)[\s\S]{0,60}(india|contact|email|officer@|@|reached at|can be reached)",
                    r"grievances may be directed to"
                ],
                "conflicting_patterns": [],
                "description": "Fiduciaries must provide an easily accessible Grievance Redressal mechanism with designated contact information."
            },
            {
                "id": "DPDP-04",
                "title": "Protection of Children's Personal Data",
                "citation": "DPDP Act 2023 Section 9",
                "patterns": [
                    r"(children|minors|under the age of 18).{0,50}(verifiable parental consent|parent or lawful guardian)",
                    r"we do not (track|behaviorally monitor|direct targeted advertisements at) children"
                ],
                "conflicting_patterns": [
                    r"we direct behavioral ads and track minors without parental consent"
                ],
                "description": "Requires verifiable parental consent before processing children's data and strictly bans behavioral tracking or targeted ads for minors."
            },
            {
                "id": "DPDP-05",
                "title": "Right to Correction and Erasure",
                "citation": "DPDP Act 2023 Section 12",
                "patterns": [
                    r"(data principal|user).{0,40}(right to correction|erasure|updating of personal data)",
                    r"request correction, completion, or updating of your personal data"
                ],
                "conflicting_patterns": [],
                "description": "Data Principals possess statutory rights to correct inaccurate data and erase data no longer necessary."
            }
        ]
    }

    @classmethod
    def evaluate(cls, text: str, frameworks: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Evaluate policy text against legal requirements of GDPR, CCPA, and DPDP.
        Distinguishes missing statements from legal breaches.
        """
        target_frameworks = frameworks or ["GDPR", "CCPA", "DPDP"]
        items: List[ComplianceItemBase] = []
        findings: List[FindingCreate] = []

        total_checked = 0
        supported_count = 0
        missing_count = 0
        conflicting_count = 0
        inconclusive_count = 0

        for fw in target_frameworks:
            fw_key = fw.upper()
            reqs = cls.FRAMEWORK_CATALOG.get(fw_key, [])
            for req in reqs:
                total_checked += 1
                req_id = req["id"]
                req_title = req["title"]
                citation = req["citation"]

                matched_evidence = ""
                is_conflicting = False
                is_supported = False

                # Check conflicting patterns first
                for c_pat in req.get("conflicting_patterns", []):
                    c_match = re.search(c_pat, text, re.IGNORECASE)
                    if c_match:
                        is_conflicting = True
                        start = max(0, c_match.start() - 60)
                        end = min(len(text), c_match.end() + 80)
                        matched_evidence = text[start:end].strip()
                        break

                if not is_conflicting:
                    # Check supporting patterns
                    for s_pat in req.get("patterns", []):
                        s_match = re.search(s_pat, text, re.IGNORECASE)
                        if s_match:
                            is_supported = True
                            start = max(0, s_match.start() - 60)
                            end = min(len(text), s_match.end() + 100)
                            matched_evidence = text[start:end].strip()
                            break

                # Determine status
                if is_conflicting:
                    status = "Conflicting"
                    conflicting_count += 1
                    notes = f"Policy excerpt appears to contradict requirements under {citation}."
                    findings.append(FindingCreate(
                        category="Legal Compliance",
                        severity="High",
                        title=f"{req_title} Contradiction ({citation})",
                        evidence=matched_evidence,
                        explanation=f"The stated policy conflicts with {citation}. Under {fw_key}, organizations must adhere to statutory safeguards.",
                        recommendation=f"Review contractual language with legal counsel to ensure alignment with {citation}.",
                        confidence=0.90,
                        source=citation,
                        clause_or_check_type=f"{fw_key.lower()}_{req_id.lower()}"
                    ))
                elif is_supported:
                    status = "Supported"
                    supported_count += 1
                    notes = f"Statement located in analyzed text aligns with standard obligations in {citation}."
                else:
                    # Check if the topic is mentioned vaguely (Inconclusive) or omitted entirely (Potentially Missing)
                    topic_keyword = req_title.split()[0].lower()
                    if topic_keyword in text.lower():
                        status = "Inconclusive"
                        inconclusive_count += 1
                        matched_evidence = f"Topic '{topic_keyword}' mentioned in text, but specific compliance criteria under {citation} are unverified."
                        notes = f"The analyzed text does not establish whether a compliant procedure exists elsewhere. Review complete legal disclosures."
                    else:
                        status = "Potentially Missing"
                        missing_count += 1
                        matched_evidence = "No matching disclosure or procedure was located in the analyzed text excerpt."
                        notes = f"Standard disclosure for {citation} was not detected. Note: A policy omission is a potential documentation gap, not an automatic legal violation."
                        findings.append(FindingCreate(
                            category="Legal Compliance",
                            severity="Medium" if fw_key in ["GDPR", "DPDP"] else "Low",
                            title=f"Potential Documentation Gap: {req_title} ({citation})",
                            evidence=f"Analyzed text does not contain explicit provisions satisfying {citation}.",
                            explanation=f"Applicable privacy regulations ({fw_key}) mandate explicit disclosures regarding {req_title.lower()}. Omission can draw regulatory inquiries or consumer disputes.",
                            recommendation=f"Audit full policy documentation to verify if {citation} is addressed in supplementary notices or annexes.",
                            confidence=0.82,
                            source=citation,
                            clause_or_check_type=f"{fw_key.lower()}_{req_id.lower()}_missing"
                        ))

                items.append(ComplianceItemBase(
                    framework=fw_key,
                    requirement_id=req_id,
                    requirement_title=req_title,
                    status=status,
                    citation=citation,
                    evidence=matched_evidence,
                    notes=notes
                ))

        # Overall compliance rating (0-100)
        # Perfect compliance is low risk score
        risk_score = 15 + (missing_count * 8) + (conflicting_count * 22) + (inconclusive_count * 4)
        risk_score = min(risk_score, 98)

        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 45:
            risk_level = "Medium"
        elif risk_score >= 25:
            risk_level = "Low"
        else:
            risk_level = "Safe"

        summary = (
            f"Evaluated policy statements against {len(target_frameworks)} regulatory frameworks ({', '.join(target_frameworks)}). "
            f"Out of {total_checked} statutory criteria: {supported_count} Supported, {missing_count} Potentially Missing, "
            f"{inconclusive_count} Inconclusive, {conflicting_count} Conflicting. "
            f"Compliance Risk Rating: {risk_level} ({risk_score}/100). "
            "Authoritative distinction: Policy text omissions represent potential documentation gaps rather than conclusive legal breaches."
        )

        return {
            "overall_risk_score": risk_score,
            "risk_level": risk_level,
            "summary": summary,
            "compliance_items": items,
            "findings": findings,
            "stats": {
                "total": total_checked,
                "supported": supported_count,
                "missing": missing_count,
                "conflicting": conflicting_count,
                "inconclusive": inconclusive_count
            }
        }
