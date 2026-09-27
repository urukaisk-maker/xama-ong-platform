"""Generador de certificado de donación (Ley 49/2002)."""
import io
from datetime import date, datetime, timezone

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


# ─── Conversión número → letra ───
UNIDADES = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis",
    "diecisiete", "dieciocho", "diecinueve", "veinte",
]
DECENAS = [
    "", "", "veinti", "treinta", "cuarenta", "cincuenta", "sesenta",
    "setenta", "ochenta", "noventa",
]
CENTENAS = [
    "", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos",
]


def _centenas_a_letras(n: int) -> str:
    if n == 0:
        return ""
    if n == 100:
        return "cien"
    if n < 21:
        return UNIDADES[n]
    if n < 100:
        d, u = divmod(n, 10)
        if d == 2:
            return f"veinti{UNIDADES[u]}" if u else "veinte"
        sep = " y " if u else ""
        return f"{DECENAS[d]}{sep}{UNIDADES[u]}"
    c, resto = divmod(n, 100)
    return f"{CENTENAS[c]} {_centenas_a_letras(resto)}".strip()


def numero_a_letras(n: int) -> str:
    if n == 0:
        return "cero"
    if n < 1000:
        return _centenas_a_letras(n)
    if n < 1_000_000:
        miles, resto = divmod(n, 1000)
        prefijo = "mil" if miles == 1 else f"{_centenas_a_letras(miles)} mil"
        if resto:
            return f"{prefijo} {_centenas_a_letras(resto)}"
        return prefijo
    return str(n)  # fallback para cantidades enormes


def importe_a_letras(amount: float) -> str:
    entero = int(amount)
    centimos = int(round((amount - entero) * 100))
    letras = numero_a_letras(entero).capitalize()
    if centimos:
        return f"{letras} euros con {numero_a_letras(centimos)} céntimos"
    return f"{letras} euros"


def build_donation_certificate(
    *,
    donor_name: str,
    donor_tax_id: str,
    amount: float,
    donation_date: date,
    concept: str | None,
    donor_address: str | None,
    recurring: bool,
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
        title=f"Certificado de donación · {donor_name}",
        author="XAMA-ONG",
    )

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "Title", parent=styles["Title"], fontSize=22,
        textColor=colors.HexColor("#065f46"), spaceAfter=0.2 * cm, alignment=1,
    )
    subtitle = ParagraphStyle(
        "Subtitle", parent=styles["Normal"], fontSize=13,
        textColor=colors.HexColor("#0f172a"), alignment=1, spaceAfter=0.4 * cm,
    )
    body = ParagraphStyle(
        "Body", parent=styles["Normal"], fontSize=11, leading=17,
        textColor=colors.HexColor("#1e293b"), alignment=1,
    )
    small = ParagraphStyle(
        "Small", parent=styles["Normal"], fontSize=8,
        textColor=colors.HexColor("#64748b"), alignment=1,
    )
    num_style = ParagraphStyle(
        "Num", parent=styles["Normal"], fontSize=9,
        textColor=colors.HexColor("#64748b"), alignment=2,
    )

    story = []
    story.append(Paragraph(f"Nº {certificate_number}", num_style))
    story.append(Spacer(1, 0.5 * cm))

    # Cabecera
    story.append(Paragraph("XAMA-ONG", title))
    story.append(
        Paragraph("Asociación sin ánimo de lucro · Reus · Tarragona", small)
    )
    story.append(Spacer(1, 1.2 * cm))

    # Título
    story.append(Paragraph("CERTIFICADO DE DONACIÓN", subtitle))
    story.append(Spacer(1, 1 * cm))

    # Cuerpo legal
    story.append(
        Paragraph(
            "D./Dña. la persona abajo firmante, en nombre y representación de "
            "XAMA-ONG, entidad sin ánimo de lucro acogida al régimen fiscal "
            "especial de la Ley 49/2002, de 23 de diciembre, de régimen fiscal "
            "de las entidades sin fines lucrativos y de los incentivos fiscales "
            "al mecenazgo,",
            body,
        )
    )
    story.append(Spacer(1, 0.7 * cm))

    story.append(Paragraph("CERTIFICA:", subtitle))
    story.append(Spacer(1, 0.7 * cm))

    story.append(
        Paragraph(
            f"Que <b>{donor_name}</b>, con NIF/DNI <b>{donor_tax_id}</b>"
            + (f", con domicilio en {donor_address}" if donor_address else "")
            + ", ha realizado una donación a esta entidad por importe de "
            f"<b>{amount:.2f} €</b> "
            f"(<i>{importe_a_letras(amount)}</i>), con fecha "
            f"<b>{donation_date.strftime('%d/%m/%Y')}</b>, "
            f"con destino a los fines propios de la entidad.",
            body,
        )
    )
    story.append(Spacer(1, 0.8 * cm))

    # Detalle
    detail = [
        ["Concepto", concept or ("Donación " + ("recurrente" if recurring else "puntual"))],
        ["Importe", f"{amount:.2f} €"],
        ["Fecha", donation_date.strftime("%d/%m/%Y")],
    ]
    t = Table(detail, colWidths=[5 * cm, 9 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecfdf5")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#065f46")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#86efac")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 1 * cm))

    # Nota fiscal
    story.append(
        Paragraph(
            "De acuerdo con la Ley 49/2002, esta donación puede ser deducible "
            "en la declaración del IRPF (personas físicas) o del Impuesto de "
            "Sociedades (personas jurídicas). Conserve este certificado como "
            "justificante.",
            small,
        )
    )
    story.append(Spacer(1, 2 * cm))

    # Firma
    sign = [
        ["", ""],
        ["___________________________", "___________________________"],
        ["Presidente/a de XAMA-ONG", "Tesorero/a de XAMA-ONG"],
    ]
    t2 = Table(sign, colWidths=[7 * cm, 7 * cm])
    t2.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#475569")),
            ]
        )
    )
    story.append(t2)

    story.append(Spacer(1, 1.5 * cm))
    story.append(
        Paragraph(
            f"Emitido en Reus el "
            f"{datetime.now(timezone.utc).strftime('%d/%m/%Y')}. "
            "Documento válido sin firma manuscrita.",
            small,
        )
    )

    doc.build(story)
    return buf.getvalue()
