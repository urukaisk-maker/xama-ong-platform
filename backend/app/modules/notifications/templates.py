"""Plantillas de email en texto plano y HTML."""


def expiring_email(
    site: str,
    batches: list[dict],
    inventory_url: str,
) -> tuple[str, str, str]:
    """Genera (subject, body_text, body_html) para el email de caducidades.

    batches: [{"product": str, "quantity": float, "unit": str,
               "expiry": str, "days": int}]
    """
    count = len(batches)
    subject = (
        f"[XAMA] {count} lote{'s' if count != 1 else ''} "
        f"caduca{'n' if count != 1 else ''} pronto en {site.capitalize()}"
    )

    # ─── Texto plano ───
    lines = [
        f"Lotes próximos a caducar en la sede de {site.capitalize()}:",
        "",
    ]
    for b in sorted(batches, key=lambda x: x["days"]):
        days = b["days"]
        day_txt = (
            "hoy" if days <= 0 else
            "mañana" if days == 1 else
            f"en {days} días"
        )
        lines.append(
            f"  · {b['product']:<25} {b['quantity']:>6.1f} {b['unit']:<8}"
            f"  caduca {day_txt}  ({b['expiry']})"
        )
    lines.extend([
        "",
        "Revisa el inventario y prioriza su distribución (FeFo) o ",
        "derívalo a la Nevera Solidària antes de que caduque.",
        "",
        f"Inventario: {inventory_url}",
        "",
        "— XAMA-ONG",
    ])
    body_text = "\n".join(lines)

    # ─── HTML ───
    rows_html = ""
    for b in sorted(batches, key=lambda x: x["days"]):
        days = b["days"]
        color = "#dc2626" if days <= 1 else "#f59e0b" if days <= 3 else "#64748b"
        day_txt = (
            "hoy" if days <= 0 else
            "mañana" if days == 1 else
            f"en {days} días"
        )
        rows_html += f"""
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">{b['product']}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">
            {b['quantity']:.1f} {b['unit']}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:{color};font-weight:600;">
            {day_txt} ({b['expiry']})
          </td>
        </tr>
        """

    body_html = f"""
    <html>
      <body style="font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;padding:24px;">
        <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <div style="background:#065f46;color:white;padding:20px 24px;">
            <div style="font-size:18px;font-weight:700;">XAMA-ONG</div>
            <div style="font-size:13px;opacity:0.9;">Alerta de caducidades · {site.capitalize()}</div>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 16px 0;color:#0f172a;">
              Hay <b>{count} lote{'s' if count != 1 else ''}</b> que caduca{'n' if count != 1 else ''} en los próximos días.
              Prioriza su distribución:
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead>
                <tr style="background:#f1f5f9;text-align:left;">
                  <th style="padding:8px 12px;font-weight:600;color:#475569;">Producto</th>
                  <th style="padding:8px 12px;font-weight:600;color:#475569;text-align:right;">Cantidad</th>
                  <th style="padding:8px 12px;font-weight:600;color:#475569;">Caduca</th>
                </tr>
              </thead>
              <tbody>{rows_html}</tbody>
            </table>
            <p style="margin:24px 0 0 0;color:#475569;font-size:13px;">
              Deriva lo que no puedas repartir a la Nevera Solidària.
            </p>
            <a href="{inventory_url}" style="display:inline-block;margin-top:16px;background:#059669;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
              Abrir inventario
            </a>
          </div>
          <div style="padding:16px 24px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
            XAMA-ONG · Reus · Tarragona
          </div>
        </div>
      </body>
    </html>
    """
    return subject, body_text, body_html
