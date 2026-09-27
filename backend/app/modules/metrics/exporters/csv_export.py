import csv
import io
from datetime import datetime, timezone


MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]


def build_csv(data: dict) -> str:
    buf = io.StringIO()
    w = csv.writer(buf, quoting=csv.QUOTE_MINIMAL)

    year = data["year"]
    impact = data["impact"]
    monthly = data["monthly"]
    volunteers = data["volunteers"]

    # Cabecera
    w.writerow(["XAMA-ONG — Informe anual"])
    w.writerow(["Año", year])
    w.writerow(["Generado", datetime.now(timezone.utc).isoformat()])
    w.writerow([])

    # Resumen ejecutivo
    w.writerow(["RESUMEN EJECUTIVO"])
    w.writerow(["Métrica", "Valor"])
    w.writerow(["Kg de alimentos recuperados", f"{impact.total_kg_recovered:.2f}"])
    w.writerow(["CO2 evitado (kg)", f"{impact.co2_avoided_kg:.2f}"])
    w.writerow(["Productos distintos", impact.total_products])
    w.writerow(["Lotes registrados", impact.total_batches])
    w.writerow(["Familias totales", impact.total_families])
    w.writerow(["Familias activas", impact.active_families])
    w.writerow(["Personas atendidas", impact.total_people])
    w.writerow(["Familias Reus", impact.reus_families])
    w.writerow(["Familias Tarragona", impact.tarragona_families])
    w.writerow(["Entregas realizadas", impact.deliveries_done])
    w.writerow(["Entregas pendientes", impact.deliveries_pending])
    w.writerow(["Raciones Nevera servidas", impact.nevera_served])
    w.writerow(["Cumplimiento Nevera (%)", f"{impact.nevera_compliance_pct:.1f}"])
    w.writerow(["Derivaciones totales", impact.derivations_total])
    w.writerow(["Derivaciones servidas", impact.derivations_served])
    w.writerow(["Voluntarios", impact.total_volunteers])
    w.writerow(["Horas de voluntariado", f"{impact.total_volunteer_hours:.2f}"])
    w.writerow(["Turnos totales", impact.total_shifts])
    w.writerow([])

    # Serie mensual
    w.writerow(["SERIE MENSUAL"])
    w.writerow(["Mes", "Kg recuperados", "Entregas", "Raciones Nevera", "Horas voluntariado"])
    for p in monthly.points:
        w.writerow([
            MONTH_NAMES[p.month - 1],
            f"{p.kg_recovered:.2f}",
            p.deliveries,
            p.nevera_served,
            f"{p.volunteer_hours:.2f}",
        ])
    w.writerow([])

    # Ranking voluntarios
    w.writerow(["RANKING VOLUNTARIADO"])
    w.writerow(["#", "Voluntario", "Horas", "Turnos"])
    for i, v in enumerate(volunteers, 1):
        w.writerow([i, v["name"], f"{v['hours']:.2f}", v["shifts"]])

    return buf.getvalue()
