import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
)

class ReportGenerator:
    @staticmethod
    def _get_severity_color(sev: str):
        s = sev.lower()
        if s == "critical":
            return colors.HexColor("#dc2626") # red
        elif s == "high":
            return colors.HexColor("#ea580c") # orange
        elif s == "medium":
            return colors.HexColor("#d97706") # amber
        elif s == "low":
            return colors.HexColor("#2563eb") # blue
        elif s in ["passed", "supported", "safe"]:
            return colors.HexColor("#16a34a") # green
        return colors.HexColor("#4b5563") # gray

    @classmethod
    def generate_pdf(cls, scan_data: Dict[str, Any]) -> bytes:
        """
        Generate a multi-page PDF risk assessment report using ReportLab.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom typography styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold"
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#475569")
        )
        h2_style = ParagraphStyle(
            "SectionH2",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold",
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "ReportBody",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1e293b")
        )
        callout_style = ParagraphStyle(
            "Callout",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#0f172a")
        )
        badge_style = ParagraphStyle(
            "BadgeStyle",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.white,
            fontName="Helvetica-Bold",
            alignment=1
        )

        elements = []

        # 1. Header Banner
        target = scan_data.get("target", "Target Artifact") or "Digital Audit"
        module_type = scan_data.get("module_type", "unified").upper()
        scan_id = scan_data.get("id", "N/A")[:8]
        created_at = scan_data.get("created_at")
        date_str = created_at.strftime("%B %d, %Y %H:%M UTC") if isinstance(created_at, datetime) else str(created_at or datetime.utcnow().strftime("%B %d, %Y"))

        header_data = [
            [
                Paragraph("<b>CYBERGUARD</b> | Threat & Risk Intelligence", title_style),
                Paragraph(f"<b>Scan ID:</b> #{scan_id}<br/><b>Date:</b> {date_str}", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[360, 180])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LINEBELOW", (0, 0), (-1, -1), 1.5, colors.HexColor("#0ea5e9")),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 14))

        # 2. Executive Score Card & Target Info
        score = scan_data.get("overall_risk_score", 0)
        risk_level = scan_data.get("risk_level", "Safe")
        score_color = cls._get_severity_color(risk_level)

        score_box = [
            [
                Paragraph(f"<font size=28><b>{score}</b></font>/100<br/><b>{risk_level.upper()} RISK</b>", ParagraphStyle("ScoreP", parent=title_style, alignment=1, textColor=score_color)),
                Paragraph(f"<b>Audit Scope:</b> {module_type} Analysis<br/><b>Target:</b> {target}<br/><b>Status:</b> Completed<br/><b>Assessment Summary:</b> {scan_data.get('summary', '')}", callout_style)
            ]
        ]
        score_table = Table(score_box, colWidths=[140, 400])
        score_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#f8fafc")),
            ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#f1f5f9")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 14))

        # 3. Findings Breakdown Summary Counts
        findings = scan_data.get("findings", [])
        crit_count = sum(1 for f in findings if getattr(f, "severity", "") == "Critical")
        high_count = sum(1 for f in findings if getattr(f, "severity", "") == "High")
        med_count = sum(1 for f in findings if getattr(f, "severity", "") == "Medium")
        low_count = sum(1 for f in findings if getattr(f, "severity", "") == "Low")

        stats_data = [
            ["Critical Severity", "High Severity", "Medium Severity", "Low Severity", "Total Findings"],
            [str(crit_count), str(high_count), str(med_count), str(low_count), str(len(findings))]
        ]
        stats_table = Table(stats_data, colWidths=[108, 108, 108, 108, 108])
        stats_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#f8fafc")),
            ("FONTSIZE", (0, 1), (-1, 1), 12),
            ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 14))

        # 4. Detailed Findings Table
        elements.append(Paragraph("Detailed Risk Findings & Evidence", h2_style))

        if not findings:
            elements.append(Paragraph("No significant security or legal risk indicators detected in this scan.", body_style))
        else:
            findings_rows = [
                ["Sev", "Finding & Evidence", "Plain English Explanation", "Recommended Action"]
            ]
            for f in findings:
                sev = getattr(f, "severity", "Low")
                title = getattr(f, "title", "Risk Finding")
                ev = getattr(f, "evidence", "")
                exp = getattr(f, "explanation", "")
                rec = getattr(f, "recommendation", "")
                src = getattr(f, "source", "")

                ev_snippet = f"<b>{title}</b><br/><font color='#64748b'>Evidence:</font> <i>{ev[:160]}...</i>" if len(ev) > 160 else f"<b>{title}</b><br/><font color='#64748b'>Evidence:</font> <i>{ev}</i>"
                if src:
                    ev_snippet += f"<br/><font color='#0284c7'>Ref: {src}</font>"

                sev_cell = Paragraph(f"<b>{sev[:4].upper()}</b>", ParagraphStyle("SevText", parent=badge_style, textColor=cls._get_severity_color(sev)))
                f_cell = Paragraph(ev_snippet, body_style)
                exp_cell = Paragraph(exp, body_style)
                rec_cell = Paragraph(rec, body_style)

                findings_rows.append([sev_cell, f_cell, exp_cell, rec_cell])

            f_table = Table(findings_rows, colWidths=[42, 178, 160, 160])
            f_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(f_table)

        # 5. Compliance Matrix (if present)
        comp_items = scan_data.get("compliance_items", [])
        if comp_items:
            elements.append(Spacer(1, 14))
            elements.append(Paragraph("Statutory Privacy Compliance Breakdown (GDPR / CCPA / DPDP)", h2_style))
            comp_rows = [["Framework", "Requirement", "Status", "Citation", "Assessment Notes"]]
            for ci in comp_items:
                fw = getattr(ci, "framework", "")
                title = getattr(ci, "requirement_title", "")
                st = getattr(ci, "status", "")
                cit = getattr(ci, "citation", "")
                notes = getattr(ci, "notes", "")

                status_color = cls._get_severity_color(st)
                st_cell = Paragraph(f"<b>{st}</b>", ParagraphStyle("CStatus", parent=body_style, textColor=status_color))

                comp_rows.append([
                    Paragraph(fw, body_style),
                    Paragraph(f"<b>{title}</b>", body_style),
                    st_cell,
                    Paragraph(cit, body_style),
                    Paragraph(notes[:140], body_style)
                ])

            comp_table = Table(comp_rows, colWidths=[55, 135, 75, 115, 160])
            comp_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(comp_table)

        # 6. Technical Website Checks (if present)
        meta = scan_data.get("metadata", {})
        if isinstance(meta, dict) and "technical_checks" in meta:
            elements.append(Spacer(1, 14))
            elements.append(Paragraph("Technical Website Security Checks", h2_style))
            tech_rows = [["Check Indicator", "Status", "Technical Details"]]
            for tc in meta.get("technical_checks", []):
                t_name = tc.get("name", "")
                t_status = tc.get("status", "")
                t_details = tc.get("details", "")

                st_color = cls._get_severity_color(t_status)
                st_p = Paragraph(f"<b>{t_status}</b>", ParagraphStyle("TStatus", parent=body_style, textColor=st_color))

                tech_rows.append([
                    Paragraph(f"<b>{t_name}</b>", body_style),
                    st_p,
                    Paragraph(t_details, body_style)
                ])

            tech_table = Table(tech_rows, colWidths=[150, 90, 300])
            tech_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(tech_table)

        # 7. Disclaimer
        elements.append(Spacer(1, 20))
        disclaimer_text = (
            "<b>Disclaimer:</b> CyberGuard is an automated digital risk discovery tool intended for informational "
            "and educational purposes. Analysis results indicate potential concerns and documentation gaps rather than "
            "definitive legal violations or absolute security guarantees. Users should engage qualified legal counsel for statutory compliance "
            "and certified penetration testing professionals for comprehensive infrastructure auditing."
        )
        elements.append(Paragraph(disclaimer_text, ParagraphStyle("Disc", parent=styles["Normal"], fontSize=7, leading=10, textColor=colors.HexColor("#64748b"))))

        # Build document
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
