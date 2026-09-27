"""Servicio de envío de emails.

Modos:
  - dryrun:  imprime el email en consola (no envía nada). Por defecto.
  - mailhog: envía a un servidor SMTP local (útil para desarrollo).
  - real:    envía a un servidor SMTP real (Brevo, Gmail, etc.).
"""
import os
import smtplib
import ssl
from email.message import EmailMessage


def _config() -> dict:
    return {
        "mode": os.getenv("SMTP_MODE", "dryrun"),
        "host": os.getenv("SMTP_HOST", "xama-mailhog"),
        "port": int(os.getenv("SMTP_PORT", "1025")),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "from_addr": os.getenv("SMTP_FROM", "xama@ejemplo.local"),
    }


def send_email(
    to: list[str],
    subject: str,
    body_text: str,
    body_html: str | None = None,
) -> dict:
    """Envía un email según el modo configurado.

    Devuelve dict con: mode, sent (bool), recipients, subject, error (str|None).
    """
    cfg = _config()
    mode = cfg["mode"]

    if mode == "dryrun":
        print("=" * 70)
        print(f"  MODO DRYRUN — no se envía nada")
        print("=" * 70)
        print(f"From:    {cfg['from_addr']}")
        print(f"To:      {', '.join(to)}")
        print(f"Subject: {subject}")
        print("-" * 70)
        print(body_text)
        print("=" * 70)
        print()
        return {
            "mode": mode,
            "sent": False,
            "recipients": to,
            "subject": subject,
            "error": None,
        }

    # Construir el mensaje
    msg = EmailMessage()
    msg["From"] = cfg["from_addr"]
    msg["To"] = ", ".join(to)
    msg["Subject"] = subject
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")

    try:
        if mode == "mailhog":
            # MailHog: SMTP sin auth ni TLS
            with smtplib.SMTP(cfg["host"], cfg["port"], timeout=10) as s:
                s.send_message(msg)
        elif mode == "real":
            context = ssl.create_default_context()
            with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as s:
                s.ehlo()
                s.starttls(context=context)
                s.ehlo()
                if cfg["user"]:
                    s.login(cfg["user"], cfg["password"])
                s.send_message(msg)
        else:
            raise ValueError(f"Modo SMTP desconocido: {mode}")

        print(f"✓ Email enviado a {', '.join(to)} — {subject}")
        return {
            "mode": mode,
            "sent": True,
            "recipients": to,
            "subject": subject,
            "error": None,
        }
    except Exception as e:
        print(f"✗ Error enviando email: {e}")
        return {
            "mode": mode,
            "sent": False,
            "recipients": to,
            "subject": subject,
            "error": str(e),
        }
