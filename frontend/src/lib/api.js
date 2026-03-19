const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de conexión' }))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// --- Público ---
export const getServices = (professionalId = 1) =>
  request(`/services/${professionalId}`)

export const getAvailability = (professionalId = 1, month, serviceId) => {
  let url = `/availability/${professionalId}?month=${month}`
  if (serviceId) url += `&service_id=${serviceId}`
  return request(url)
}

export const getSlots = (professionalId = 1, date, serviceId) => {
  let url = `/slots/${professionalId}?date=${date}`
  if (serviceId) url += `&service_id=${serviceId}`
  return request(url)
}

export const createAppointment = (data) =>
  request('/appointments', { method: 'POST', body: JSON.stringify(data) })

export const cancelAppointment = (token) =>
  request(`/appointments/cancel/${token}`, { method: 'POST' })

export const rescheduleAppointment = (token, data) =>
  request(`/appointments/reschedule/${token}`, { method: 'POST', body: JSON.stringify(data) })

// --- Admin ---
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const getAppointments = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/admin/appointments${qs ? '?' + qs : ''}`, { headers: authHeaders() })
}

export const updateAppointmentStatus = (id, status) =>
  request(`/admin/appointments/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })

export const getSchedules = () =>
  request('/admin/schedules', { headers: authHeaders() })

export const createSchedule = (data) =>
  request('/admin/schedules', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })

export const updateSchedule = (id, data) =>
  request(`/admin/schedules/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })

export const deleteSchedule = (id) =>
  request(`/admin/schedules/${id}`, { method: 'DELETE', headers: authHeaders() })

export const adminRescheduleAppointment = (id, data) =>
  request(`/admin/appointments/${id}/reschedule`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })

export const updatePaymentStatus = (id, status) =>
  request(`/admin/appointments/${id}/payment?status=${status}`, {
    method: 'PUT',
    headers: authHeaders(),
  })

export const changePassword = (currentPassword, newPassword) =>
  request('/admin/password', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
