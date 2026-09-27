"""Generador de Excel con formato para empresas donantes."""
import io
from datetime import datetime, timezone

from openpyxl import Workbook
from openpyxl.styles import (
    Alignment,
    Border,
    Font,
    PatternFill,
    Side,
)
from openpyxl.utils import get_column_letter


# ─── Paleta XAMA ───
XAMA_GREEN = "065F46"
XAMA_LIGHT = "ECFDF5"
SLATE_900 = "0F172A"
SLATE_500 = "64748B"
AMBER = "F59E0B"
ROSE = "DC2626"

MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]


def _style_header(cell, bg=XAMA_GREEN):
    cell.font = Font(bold=True, color="FFFFFF", size=11)
    cell.fill = PatternFill(start_color=bg, end_color=bg, fill_type="solid")
    cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)


def _style_title(cell):
    cell.font = Font(bold=True, size=18, color=SLATE_900)


def _style_subtitle(cell):
    cell.font = Font(size=11, color=SLATE_500, italic=True)


def _border():
    thin = Side(border_style="thin", color="E2E8F0")
    return Border(left=thin, right=thin, top=thin, bottom=thin)


def _auto_width(ws, min_w=12, max_w=40):
    for col in ws.columns:
        length = 0
        letter = None
        for cell in col:
            if letter is None and hasattr(cell, "column_letter"):
                letter = cell.column_letter
            val = str(cell.value) if cell.value is not None else ""
            length = max(length, len(val))
        if letter:
            ws.column_dimensions[letter].width = min(
                max(length + 3, min_w), max_w
            )


def build_excel(data: dict) -> bytes:
    """Genera el Excel completo. `data` viene de service.export_pdf_data."""
    year = data["year"]
    impact = data["impact"]
    monthly = data["monthly"]
    volunteers = data["volunteers"]

    wb = Workbook()

    # ═══════════════════════════════════════════
    # HOJA 1 — RESUMEN
    # ═══════════════════════════════════════════
    ws = wb.active
    ws.title = "Resumen"

    ws["A1"] = "XAMA-ONG"
    _style_title(ws["A1"])
    ws["A2"] = f"Informe de impacto {year}"
    _style_subtitle(ws["A2"])
    ws["A3"] = (
        f"Generado el {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')} UTC"
    )
    ws["A3"].font = Font(size=9, color=SLATE_500)

    ws["A5"] = "RESUMEN EJECUTIVO"
    _style_header(ws["A5"], XAMA_GREEN)
    ws.merge_cells("A5:B5")

    rows = [
        ("Alimentos recuperados", f"{impact.total_kg_recovered:.1f} kg"),
        ("CO₂ evitado", f"{impact.co2_avoided_kg:.1f} kg"),
        ("Productos distintos", impact.total_products),
        ("Lotes registrados", impact.total_batches),
        ("", ""),
        ("Familias atendidas (activas)", impact.active_families),
        ("Personas beneficiarias", impact.total_people),
        ("Familias en Reus", impact.reus_families),
        ("Familias en Tarragona", impact.tarragona_families),
        ("", ""),
        ("Entregas realizadas", impact.deliveries_done),
        ("Entregas pendientes", impact.deliveries_pending),
        ("", ""),
        ("Raciones Nevera servidas", impact.nevera_served),
        ("Objetivo Nevera", impact.nevera_target),
        ("Cumplimiento Nevera", f"{impact.nevera_compliance_pct:.1f}%"),
        ("", ""),
        ("Derivaciones atendidas", impact.derivations_served),
        ("Derivaciones totales", impact.derivations_total),
        ("", ""),
        ("Voluntarios", impact.total_volunteers),
        ("Horas de voluntariado", f"{impact.total_volunteer_hours:.1f} h"),
        ("Turnos planificados", impact.total_shifts),
    ]

    r = 6
    for label, value in rows:
        if label:
            ws.cell(row=r, column=1, value=label).font = Font(size=11, color=SLATE_900)
            c = ws.cell(row=r, column=2, value=value)
            c.font = Font(size=11, bold=True, color=XAMA_GREEN)
            c.alignment = Alignment(horizontal="right")
            ws.cell(row=r, column=1).border = _border()
            c.border = _border()
        r += 1

    ws.column_dimensions["A"].width = 35
    ws.column_dimensions["B"].width = 20

    # ═══════════════════════════════════════════
    # HOJA 2 — SERIE MENSUAL
    # ═══════════════════════════════════════════
    ws2 = wb.create_sheet("Serie mensual")
    ws2["A1"] = f"Evolución mensual {year}"
    _style_title(ws2["A1"])

    headers = ["Mes", "Kg recuperados", "Entregas", "Raciones Nevera", "Horas voluntariado"]
    for i, h in enumerate(headers, 1):
        c = ws2.cell(row=3, column=i, value=h)
        _style_header(c)

    r = 4
    for p in monthly.points:
        ws2.cell(row=r, column=1, value=MONTH_NAMES[p.month - 1])
        ws2.cell(row=r, column=2, value=round(p.kg_recovered, 1)).number_format = "#,##0.0"
        ws2.cell(row=r, column=3, value=p.deliveries).number_format = "#,##0"
        ws2.cell(row=r, column=4, value=p.nevera_served).number_format = "#,##0"
        ws2.cell(row=r, column=5, value=round(p.volunteer_hours, 1)).number_format = "#,##0.0"
        for col in range(1, 6):
            ws2.cell(row=r, column=col).border = _border()
            if r % 2 == 0:
                ws2.cell(row=r, column=col).fill = PatternFill(
                    start_color="F8FAFC", end_color="F8FAFC", fill_type="solid"
                )
        r += 1

    # Fila de totales
    ws2.cell(row=r, column=1, value="TOTAL").font = Font(bold=True, color="FFFFFF")
    ws2.cell(row=r, column=1).fill = PatternFill(
        start_color=XAMA_GREEN, end_color=XAMA_GREEN, fill_type="solid"
    )
    tot_kg = sum(p.kg_recovered for p in monthly.points)
    tot_del = sum(p.deliveries for p in monthly.points)
    tot_nev = sum(p.nevera_served for p in monthly.points)
    tot_h = sum(p.volunteer_hours for p in monthly.points)
    for i, v in enumerate([tot_kg, tot_del, tot_nev, tot_h], 2):
        c = ws2.cell(row=r, column=i, value=round(v, 1) if i in (2, 5) else v)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill(start_color=XAMA_GREEN, end_color=XAMA_GREEN, fill_type="solid")
        c.number_format = "#,##0.0" if i in (2, 5) else "#,##0"

    _auto_width(ws2)

    # ═══════════════════════════════════════════
    # HOJA 3 — RANKING VOLUNTARIADO
    # ═══════════════════════════════════════════
    ws3 = wb.create_sheet("Voluntariado")
    ws3["A1"] = "Ranking de voluntariado"
    _style_title(ws3["A1"])

    headers3 = ["#", "Voluntario/a", "Horas", "Turnos", "Asistidos"]
    for i, h in enumerate(headers3, 1):
        _style_header(ws3.cell(row=3, column=i, value=h))

    r = 4
    for i, v in enumerate(volunteers[:30], 1):
        ws3.cell(row=r, column=1, value=i).alignment = Alignment(horizontal="center")
        ws3.cell(row=r, column=2, value=v["name"])
        ws3.cell(row=r, column=3, value=round(v["hours"], 1)).number_format = "#,##0.0"
        ws3.cell(row=r, column=4, value=v["shifts"])
        ws3.cell(row=r, column=5, value=v.get("attended", 0))

        # Colorear las 3 primeras posiciones
        if i <= 3:
            for col in range(1, 6):
                ws3.cell(row=r, column=col).fill = PatternFill(
                    start_color=XAMA_LIGHT, end_color=XAMA_LIGHT, fill_type="solid"
                )
            ws3.cell(row=r, column=1).font = Font(bold=True, color=XAMA_GREEN)

        for col in range(1, 6):
            ws3.cell(row=r, column=col).border = _border()
        r += 1

    _auto_width(ws3)

    # ═══════════════════════════════════════════
    # HOJA 4 — POR SEDE
    # ═══════════════════════════════════════════
    ws4 = wb.create_sheet("Por sede")
    ws4["A1"] = "Comparativa Reus / Tarragona"
    _style_title(ws4["A1"])

    ws4["A3"] = "Métrica"
    ws4["B3"] = "Reus"
    ws4["C3"] = "Tarragona"
    ws4["D3"] = "Total"
    for col in ["A3", "B3", "C3", "D3"]:
        _style_header(ws4[col])

    # Familias
    site_rows = [
        ("Familias", impact.reus_families, impact.tarragona_families),
        ("Familias activas", impact.reus_families, impact.tarragona_families),
    ]
    r = 4
    for label, reus, tgn in site_rows:
        ws4.cell(row=r, column=1, value=label)
        ws4.cell(row=r, column=2, value=reus)
        ws4.cell(row=r, column=3, value=tgn)
        ws4.cell(row=r, column=4, value=reus + tgn).font = Font(bold=True)
        for col in range(1, 5):
            ws4.cell(row=r, column=col).border = _border()
        r += 1

    _auto_width(ws4)

    # ═══════════════════════════════════════════
    # HOJA 5 — NOTAS
    # ═══════════════════════════════════════════
    ws5 = wb.create_sheet("Notas")
    ws5["A1"] = "Sobre este informe"
    _style_title(ws5["A1"])

    notes = [
        "",
        "Este informe ha sido generado automáticamente por la Plataforma",
        "Integral XAMA-ONG, un sistema de código abierto desarrollado para",
        "la gestión logística de la recuperación y distribución de alimentos.",
        "",
        "Los datos corresponden al período anual indicado y se actualizan",
        "en tiempo real en el sistema. Pueden verificarse en:",
        "",
        "    https://github.com/urukaisk-maker/xama-ong-platform",
        "",
        "Factor de conversión CO₂: 2,5 kg de CO₂ evitados por kg de alimento",
        "recuperado (evita producción, transporte y residuo).",
        "",
        "Contacto:",
        "    Email:  hola@xamaong.cat",
        "    Web:    xamaong.cat",
        "    Sede:   Reus · Tarragona",
        "",
        "Este documento puede utilizarse para justificar subvenciones,",
        "memorias de sostenibilidad (ESG) y comunicación corporativa.",
    ]
    r = 3
    for line in notes:
        ws5.cell(row=r, column=1, value=line).font = Font(
            size=11, color=SLATE_900 if line else SLATE_500
        )
        r += 1

    ws5.column_dimensions["A"].width = 70

    # ─── Guardar ───
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
