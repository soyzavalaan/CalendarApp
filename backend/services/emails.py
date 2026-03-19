import httpx
from config import get_settings


async def _send_email(to: str, subject: str, html: str):
    settings = get_settings()
    if not settings.resend_api_key:
        print(f"[EMAIL SKIP] No RESEND_API_KEY configurada. To: {to}, Subject: {subject}")
        return

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": f"{settings.professional_name} <{settings.sender_email}>",
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )


def _format_date(d) -> str:
    months = [
        "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ]
    return f"{d.day} de {months[d.month]} de {d.year}"


def _format_time(t) -> str:
    return t.strftime("%H:%M")


def _base_html(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
{content}
</div>
<p style="text-align:center;color:#a1a1aa;font-size:12px;margin:16px 0">
  Sistema de Citas — {get_settings().professional_name}
</p>
</body></html>"""


async def send_confirmation_patient(appointment, service_name: str, cancel_url: str):
    settings = get_settings()
    html = _base_html(f"""
    <div style="background:#059669;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">✅ Cita Confirmada</h1>
    </div>
    <div style="padding:24px">
      <p style="color:#374151;margin:0 0 16px">Hola <strong>{appointment.patient_name}</strong>, tu cita ha sido agendada.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Profesional</td><td style="padding:8px 0;font-weight:600">{settings.professional_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Servicio</td><td style="padding:8px 0;font-weight:600">{service_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Fecha</td><td style="padding:8px 0;font-weight:600">{_format_date(appointment.appointment_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Hora</td><td style="padding:8px 0;font-weight:600">{_format_time(appointment.appointment_time)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Modalidad</td><td style="padding:8px 0;font-weight:600">{appointment.modality.capitalize()}</td></tr>
      </table>
      <div style="margin:24px 0;text-align:center">
        <a href="{cancel_url}" style="display:inline-block;padding:10px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
          Cancelar Cita
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center">Las cancelaciones deben realizarse con al menos 24 horas de anticipación.</p>
    </div>""")

    await _send_email(appointment.patient_email, "Confirmación de Cita", html)


async def send_confirmation_admin(appointment, service_name: str):
    settings = get_settings()
    if not settings.notification_email:
        return

    html = _base_html(f"""
    <div style="background:#2563eb;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">📅 Nueva Cita Agendada</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Paciente</td><td style="padding:8px 0;font-weight:600">{appointment.patient_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">{appointment.patient_email}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Teléfono</td><td style="padding:8px 0">{appointment.patient_phone or "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Servicio</td><td style="padding:8px 0;font-weight:600">{service_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Fecha</td><td style="padding:8px 0;font-weight:600">{_format_date(appointment.appointment_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Hora</td><td style="padding:8px 0;font-weight:600">{_format_time(appointment.appointment_time)}</td></tr>
      </table>
    </div>""")

    await _send_email(settings.notification_email, f"Nueva Cita: {appointment.patient_name}", html)


async def send_cancellation_patient(appointment, service_name: str):
    html = _base_html(f"""
    <div style="background:#dc2626;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">❌ Cita Cancelada</h1>
    </div>
    <div style="padding:24px">
      <p style="color:#374151;margin:0 0 16px">Hola <strong>{appointment.patient_name}</strong>, tu cita ha sido cancelada.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Fecha</td><td style="padding:8px 0">{_format_date(appointment.appointment_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Hora</td><td style="padding:8px 0">{_format_time(appointment.appointment_time)}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:13px;margin:16px 0 0">Si deseas reagendar, visita nuestro sitio web.</p>
    </div>""")

    await _send_email(appointment.patient_email, "Cita Cancelada", html)


async def send_cancellation_admin(appointment, service_name: str):
    settings = get_settings()
    if not settings.notification_email:
        return

    html = _base_html(f"""
    <div style="background:#dc2626;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">❌ Cita Cancelada</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Paciente</td><td style="padding:8px 0;font-weight:600">{appointment.patient_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Fecha</td><td style="padding:8px 0">{_format_date(appointment.appointment_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Hora</td><td style="padding:8px 0">{_format_time(appointment.appointment_time)}</td></tr>
      </table>
    </div>""")

    await _send_email(settings.notification_email, f"Cita Cancelada: {appointment.patient_name}", html)


async def send_reschedule_patient(appointment, service_name: str, old_date, old_time):
    html = _base_html(f"""
    <div style="background:#f59e0b;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">🔄 Cita Reagendada</h1>
    </div>
    <div style="padding:24px">
      <p style="color:#374151;margin:0 0 16px">Hola <strong>{appointment.patient_name}</strong>, tu cita ha sido reagendada.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Fecha anterior</td><td style="padding:8px 0;text-decoration:line-through">{_format_date(old_date)} a las {_format_time(old_time)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Nueva fecha</td><td style="padding:8px 0;font-weight:600">{_format_date(appointment.appointment_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Nueva hora</td><td style="padding:8px 0;font-weight:600">{_format_time(appointment.appointment_time)}</td></tr>
      </table>
    </div>""")

    await _send_email(appointment.patient_email, "Cita Reagendada", html)


async def send_reschedule_admin(appointment, service_name: str, old_date, old_time):
    settings = get_settings()
    if not settings.notification_email:
        return

    html = _base_html(f"""
    <div style="background:#f59e0b;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">🔄 Cita Reagendada</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Paciente</td><td style="padding:8px 0;font-weight:600">{appointment.patient_name}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Fecha anterior</td><td style="padding:8px 0;text-decoration:line-through">{_format_date(old_date)} a las {_format_time(old_time)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Nueva fecha</td><td style="padding:8px 0;font-weight:600">{_format_date(appointment.appointment_date)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Nueva hora</td><td style="padding:8px 0;font-weight:600">{_format_time(appointment.appointment_time)}</td></tr>
      </table>
    </div>""")

    await _send_email(settings.notification_email, f"Cita Reagendada: {appointment.patient_name}", html)
