import io
from datetime import datetime, timezone

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


def build_certificate(
    *,
    full_name: str,
    dni: str | None,
    site: str | None,
    total_hours: float,
    total_shifts: int,
    shifts_attended: int,
    first_shift_date,
    certificate_number: str,
) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2 * cm,
        title=f"Certificado de voluntariado · {full_name}",
        author="XAMA-ONG",
    )

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontSize=26,
        textColor=colors.HexColor("#065f46"),
        spaceAfter=0.2 * cm,
        alignment=1,
    )
    subtitle = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=13,
        textColor=colors.HexColor("#0f172a"),
        alignment=1,
        spaceAfter=0.6 * cm,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=12,
        leading=18,
        textColor=colors.HexColor("#1e293b"),
        alignment=1,
    )
    small = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748b"),
        alignment=1,
    )
    num_style = ParagraphStyle(
        "Num",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748b"),
        alignment=2,
    )

    story = []

    # Número de certificado
    story.append(Paragraph(f"Nº {certificate_number}", num_style))
    story.append(Spacer(1, 0.5 * cm))

    # Cabecera
    story.append(Paragraph("XAMA-ONG", title))
    story.append(
        Paragraph(
            "Asociación sin ánimo de lucro · Reus · Tarragona",
            small,
        )
    )
    story.append(Spacer(1, 1.2 * cm))

    # Título certificado
    story.append(
        Paragraph(
            "CERTIFICADO DE VOLUNTARIADO",
            subtitle,
        )
    )
    story.append(Spacer(1, 1 * cm))

    # Cuerpo
    story.append(
        Paragraph(
            "La Junta Directiva de XAMA-ONG certifica que:",
            body,
        )
    )
    story.append(Spacer(1, 0.7 * cm))

    name_line = f"<b>{full_name}</b>"
    if dni:
        name_line += f"<br/>con DNI/NIE <b>{dni}</b>"

    story.append(Paragraph(name_line, body))
    story.append(Spacer(1, 0.7 * cm))

    site_txt = ""
    if site:
        site_txt = f" en la sede de <b>{site.capitalize()}</b>"

    story.append(
        Paragraph(
            f"ha colaborado como voluntario/a{site_txt} "
            f"en las actividades de recuperación, clasificación y "
            f"distribución de alimentos que nuestra entidad desarrolla.",
            body,
        )
    )
    story.append(Spacer(1, 1 * cm))

    # Tabla de datos
    period_start = (
        first_shift_date.strftime("%d/%m/%Y") if first_shift_date else "—"
    )
    period_end = datetime.now(timezone.utc).strftime("%d/%m/%Y")

    data = [
        ["Métrica", "Valor"],
        ["Horas acreditadas", f"{total_hours:.1f} h"],
        ["Turnos realizados", str(total_shifts)],
        ["Turnos con asistencia", str(shifts_attended)],
        ["Período", f"{period_start} — {period_end}"],
    ]
    t = Table(data, colWidths=[8 * cm, 6 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065f46")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f0fdf4")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#86efac")),
                ("ALIGN", (1, 1), (1, -1), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 2 * cm))

    # Firma
    sign_data = [
        ["", ""],
        ["_______________________", "_______________________"],
        ["Presidente/a", "Secretario/a"],
    ]
    t2 = Table(sign_data, colWidths=[7 * cm, 7 * cm])
    t2.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#475569")),
            ]
        )
    )
    story.append(t2)

    story.append(Spacer(1, 1.5 * cm))
    story.append(
        Paragraph(
            f"Emitido en Reus el {datetime.now(timezone.utc).strftime('%d/%m/%Y')}. "
            f"Este certificado puede verificarse en la plataforma de XAMA-ONG.",
            small,
        )
    )

    doc.build(story)
    return buf.getvalue()
