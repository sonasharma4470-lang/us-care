"""Notification helpers — email (SMTP) + WhatsApp (Meta Cloud API).
Both are best-effort background tasks; failures are logged but don't block the API response.
Settings are read at call time from MongoDB so admin can update them without restart.
"""
import os
import logging
import smtplib
import ssl
from email.message import EmailMessage
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


def _fmt_appointment(a: dict, clinic_name: str) -> tuple[str, str, str]:
    """Return (subject, text_body, whatsapp_body) for a new appointment."""
    subject = f"[{clinic_name}] New Appointment — {a.get('patient_name', 'Patient')} ({a.get('appointment_code','')})"
    lines = [
        f"New appointment request received.",
        "",
        f"Appointment ID : {a.get('appointment_code','')}",
        f"Patient Name   : {a.get('patient_name','')}",
        f"Phone          : {a.get('phone','')}",
        f"WhatsApp       : {a.get('whatsapp','') or '-'}",
        f"Email          : {a.get('email','') or '-'}",
        f"Age / Gender   : {a.get('age','')} / {a.get('gender','')}",
        f"Service        : {a.get('service_name','') or '-'}",
        f"Preferred Doctor: {a.get('doctor_name','') or '-'}",
        f"Preferred Date : {a.get('preferred_date','') or '-'}",
        f"Preferred Time : {a.get('preferred_time','') or '-'}",
        f"Address        : {a.get('address','') or '-'}",
        f"Notes          : {a.get('message','') or '-'}",
        f"Booked at      : {a.get('created_at','')}",
    ]
    body = "\n".join(lines)
    return subject, body, body


def _fmt_contact(c: dict, clinic_name: str) -> tuple[str, str, str]:
    subject = f"[{clinic_name}] New Contact Enquiry — {c.get('name','')}"
    lines = [
        f"New contact form submission.",
        "",
        f"Name    : {c.get('name','')}",
        f"Phone   : {c.get('phone','') or '-'}",
        f"Email   : {c.get('email','') or '-'}",
        f"Subject : {c.get('subject','') or '-'}",
        f"Message : {c.get('message','') or '-'}",
        f"Received: {c.get('created_at','')}",
    ]
    body = "\n".join(lines)
    return subject, body, body


def render_template(template: str, ctx: dict) -> str:
    """Simple {{ variable }} template substitution."""
    if not template:
        return ""
    out = template
    for k, v in ctx.items():
        out = out.replace("{{" + k + "}}", str(v or "-"))
        out = out.replace("{{ " + k + " }}", str(v or "-"))
    return out


async def send_email_smtp(settings: dict, to_email: str, subject: str, body: str) -> tuple[bool, str]:
    """Send email using SMTP settings from admin panel."""
    ns = (settings or {}).get("notifications") or {}
    if not ns.get("email_enabled"):
        return False, "email disabled"
    host = ns.get("smtp_host")
    port = int(ns.get("smtp_port") or 587)
    username = ns.get("smtp_username")
    password = ns.get("smtp_password")
    sender = ns.get("smtp_from") or username
    if not (host and username and password and sender and to_email):
        return False, "SMTP not fully configured"
    try:
        msg = EmailMessage()
        msg["From"] = sender
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body)

        context = ssl.create_default_context()
        # Choose STARTTLS (port 587) or SSL (port 465)
        if port == 465:
            with smtplib.SMTP_SSL(host, port, context=context, timeout=15) as server:
                server.login(username, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.ehlo()
                server.starttls(context=context)
                server.login(username, password)
                server.send_message(msg)
        return True, "sent"
    except Exception as e:
        logger.exception("SMTP send failed")
        return False, str(e)


async def send_whatsapp(settings: dict, to_number: str, body: str) -> tuple[bool, str]:
    """Send WhatsApp text via Meta Cloud API (graph.facebook.com).
    Requires: notifications.whatsapp_provider == 'meta', whatsapp_access_token, whatsapp_phone_id
    """
    ns = (settings or {}).get("notifications") or {}
    if not ns.get("whatsapp_enabled"):
        return False, "whatsapp disabled"
    provider = (ns.get("whatsapp_provider") or "").lower()
    token = ns.get("whatsapp_access_token")
    phone_id = ns.get("whatsapp_phone_id")
    admin_num = to_number or ns.get("whatsapp_admin_number")
    if not (provider == "meta" and token and phone_id and admin_num):
        return False, "WhatsApp API not configured"
    # Clean phone number (digits only, no plus/spaces)
    clean = "".join(ch for ch in str(admin_num) if ch.isdigit())
    if not clean:
        return False, "invalid recipient"
    url = f"https://graph.facebook.com/v20.0/{phone_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": clean,
        "type": "text",
        "text": {"body": body[:4090]},
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
        if r.status_code >= 400:
            return False, f"HTTP {r.status_code}: {r.text[:200]}"
        return True, "sent"
    except Exception as e:
        logger.exception("WhatsApp send failed")
        return False, str(e)


async def notify_new_appointment(settings: dict, appointment: dict) -> dict:
    """Fire-and-forget best-effort notification. Returns status dict."""
    clinic = (settings or {}).get("clinic_name") or "Clinic"
    ns = (settings or {}).get("notifications") or {}
    subj, body, wa_body = _fmt_appointment(appointment, clinic)

    # Use custom template if provided
    tpl = ns.get("whatsapp_appointment_template")
    if tpl:
        ctx = {
            "clinic": clinic,
            "code": appointment.get("appointment_code", ""),
            "name": appointment.get("patient_name", ""),
            "phone": appointment.get("phone", ""),
            "email": appointment.get("email", ""),
            "service": appointment.get("service_name", ""),
            "doctor": appointment.get("doctor_name", ""),
            "date": appointment.get("preferred_date", ""),
            "time": appointment.get("preferred_time", ""),
            "message": appointment.get("message", ""),
        }
        wa_body = render_template(tpl, ctx)

    result = {}
    admin_email = ns.get("admin_email") or (settings or {}).get("email")
    if admin_email:
        ok, msg = await send_email_smtp(settings, admin_email, subj, body)
        result["email"] = {"ok": ok, "detail": msg}
    admin_wa = ns.get("whatsapp_admin_number") or (settings or {}).get("whatsapp")
    if admin_wa:
        ok, msg = await send_whatsapp(settings, admin_wa, wa_body)
        result["whatsapp"] = {"ok": ok, "detail": msg}
    return result


async def notify_new_contact(settings: dict, contact: dict) -> dict:
    clinic = (settings or {}).get("clinic_name") or "Clinic"
    ns = (settings or {}).get("notifications") or {}
    subj, body, wa_body = _fmt_contact(contact, clinic)

    tpl = ns.get("whatsapp_contact_template")
    if tpl:
        wa_body = render_template(tpl, {
            "clinic": clinic,
            "name": contact.get("name", ""),
            "phone": contact.get("phone", ""),
            "email": contact.get("email", ""),
            "subject": contact.get("subject", ""),
            "message": contact.get("message", ""),
        })

    result = {}
    admin_email = ns.get("admin_email") or (settings or {}).get("email")
    if admin_email:
        ok, msg = await send_email_smtp(settings, admin_email, subj, body)
        result["email"] = {"ok": ok, "detail": msg}
    admin_wa = ns.get("whatsapp_admin_number") or (settings or {}).get("whatsapp")
    if admin_wa:
        ok, msg = await send_whatsapp(settings, admin_wa, wa_body)
        result["whatsapp"] = {"ok": ok, "detail": msg}
    return result
