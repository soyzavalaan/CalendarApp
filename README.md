# Sistema de Citas — Jakeline Blas

Sistema de agenda para profesional de salud con wizard de reserva público y panel administrativo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| BD | SQLite (dev) / PostgreSQL (prod) |
| Emails | Resend API |
| Auth | JWT |

## Configuración rápida

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copiar y editar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar hash de password admin
python -c "from passlib.hash import bcrypt; print(bcrypt.hash('tu-password'))"
# Pegar el resultado en ADMIN_PASSWORD_HASH en .env

# Ejecutar
uvicorn main:app --reload
```

El servidor arranca en `http://localhost:8000`. Documentación interactiva en `/docs`.

### Frontend

```bash
cd frontend
npm install

# Copiar y editar variables de entorno
cp .env.example .env

# Ejecutar
npm run dev
```

El frontend arranca en `http://localhost:5173`.

## Rutas del frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Wizard de reserva (público) |
| `/cancelar?token=xxx` | Cancelación de cita |
| `/login` | Login admin |
| `/admin` | Panel administrativo |

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/services/{professional_id}` | Servicios activos |
| GET | `/availability/{professional_id}?month=YYYY-MM` | Días con disponibilidad |
| GET | `/slots/{professional_id}?date=YYYY-MM-DD&service_id=N` | Horarios disponibles |
| POST | `/appointments` | Crear cita |
| POST | `/appointments/cancel/{token}` | Cancelar por token |

### Admin (JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Obtener token JWT |
| GET | `/admin/appointments` | Listar citas |
| PUT | `/admin/appointments/{id}/status` | Cambiar estado |
| GET | `/admin/schedules` | Listar horarios |
| POST | `/admin/schedules` | Crear horario |
| PUT | `/admin/schedules/{id}` | Editar horario |
| DELETE | `/admin/schedules/{id}` | Eliminar horario |

## Deploy

- **Frontend** → Vercel: conectar repo, directorio `frontend/`, comando `npm run build`
- **Backend** → Railway/Render: directorio `backend/`, comando `uvicorn main:app --host 0.0.0.0 --port $PORT`

En producción, cambiar `DATABASE_URL` a PostgreSQL y configurar `VITE_API_URL` con la URL del backend.
