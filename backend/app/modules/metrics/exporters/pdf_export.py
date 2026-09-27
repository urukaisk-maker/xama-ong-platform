import io
from datetime import UTC, datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]


def build_pdf(data: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=f"Informe XAMA-ONG {data['year']}",
        author="XAMA-ONG",
    )

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle(
        "H1", parent=styles["Heading1"], fontSize=22, textColor=colors.HexColor("#0f172a")
    )
    h2 = ParagraphStyle(
        "H2", parent=styles["Heading2"], fontSize=14, textColor=colors.HexColor("#0f172a")
    )
    small = ParagraphStyle(
        "small", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#64748b")
    )

    story = []
    year = data["year"]
    impact = data["impact"]
    monthly = data["monthly"]
    volunteers = data["volunteers"]

    # ─── Portada ───
    story.append(Spacer(1, 3 * cm))
    story.append(Paragraph("XAMA-ONG", h1))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"Informe de actividad {year}", h2))
    story.append(Spacer(1, 0.3 * cm))
    story.append(
        Paragraph(
            "Plataforma Integral XAMA · Reus · Tarragona",
            small,
        )
    )
    story.append(Spacer(1, 0.5 * cm))
    story.append(
        Paragraph(
            f"Generado el {datetime.now(UTC).strftime('%d/%m/%Y a las %H:%M UTC')}",
            small,
        )
    )
    story.append(Spacer(1, 2 * cm))

    # ─── Resumen ejecutivo ───
    story.append(Paragraph("Resumen ejecutivo", h2))
    story.append(Spacer(1, 0.3 * cm))

    summary_data = [
        ["Métrica", "Valor"],
        ["Kg de alimentos recuperados", f"{impact.total_kg_recovered:.1f}"],
        ["CO₂ evitado (kg)", f"{impact.co2_avoided_kg:.1f}"],
        ["Familias atendidas", str(impact.active_families)],
        ["Personas beneficiarias", str(impact.total_people)],
        ["Entregas realizadas", str(impact.deliveries_done)],
        ["Raciones Nevera servidas", str(impact.nevera_served)],
        ["Cumplimiento Nevera", f"{impact.nevera_compliance_pct:.1f}%"],
        ["Derivaciones atendidas", str(impact.derivations_served)],
        ["Voluntarios activos", str(impact.total_volunteers)],
        ["Horas de voluntariado", f"{impact.total_volunteer_hours:.1f}"],
    ]
    t = Table(summary_data, colWidths=[9 * cm, 6 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 0.8 * cm))

    # ─── Serie mensual ───
    story.append(Paragraph(f"Evolución mensual {year}", h2))
    story.append(Spacer(1, 0.3 * cm))

    monthly_data = [
        ["Mes", "Kg", "Entregas", "Nevera", "Horas"],
    ]
    for p in monthly.points:
        monthly_data.append([
            MONTH_NAMES[p.month - 1],
            f"{p.kg_recovered:.1f}",
            str(p.deliveries),
            str(p.nevera_served),
            f"{p.volunteer_hours:.1f}",
        ])

    total_kg = sum(p.kg_recovered for p in monthly.points)
    total_del = sum(p.deliveries for p in monthly.points)
    total_nev = sum(p.nevera_served for p in monthly.points)
    total_h = sum(p.volunteer_hours for p in monthly.points)
    monthly_data.append(
        ["TOTAL", f"{total_kg:.1f}", str(total_del), str(total_nev), f"{total_h:.1f}"]
    )

    t2 = Table(monthly_data, colWidths=[3.5 * cm, 3 * cm, 3 * cm, 3 * cm, 3 * cm])
    t2.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e2e8f0")),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(t2)
    story.append(Spacer(1, 0.8 * cm))

    # ─── Ranking voluntarios ───
    story.append(Paragraph("Ranking de voluntariado", h2))
    story.append(Spacer(1, 0.3 * cm))

    if volunteers:
        vol_data = [["#", "Voluntario/a", "Horas", "Turnos"]]
        for i, v in enumerate(volunteers[:20], 1):
            vol_data.append([
                str(i),
                v["name"],
                f"{v['hours']:.1f}",
                str(v["shifts"]),
            ])

        t3 = Table(vol_data, colWidths=[1.5 * cm, 9 * cm, 2.5 * cm, 2.5 * cm])
        t3.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#cbd5e1")),
                    ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(t3)
    else:
        story.append(Paragraph("Sin datos de voluntariado registrados.", styles["Normal"]))

    story.append(Spacer(1, 1 * cm))
    story.append(
        Paragraph(
            "Documento generado automáticamente por la Plataforma Integral XAMA. "
            "Válido para presentación en Asamblea General, justificación de subvenciones "
            "y memorias de actividad para empresas donantes.",
            small,
        )
    )

    doc.build(story)
    return buf.getvalue()
