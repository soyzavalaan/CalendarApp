import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import AppointmentCard from '../components/AppointmentCard'
import {
  getAppointments,
  updateAppointmentStatus,
  getSchedules,
  createSchedule,
  deleteSchedule,
} from '../lib/api'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('appointments')

  // Appointments state
  const [appointments, setAppointments] = useState([])
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
  const [statusFilter, setStatusFilter] = useState('')
  const [loadingAppts, setLoadingAppts] = useState(false)

  // Schedules state
  const [schedules, setSchedules] = useState([])
  const [loadingSched, setLoadingSched] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '14:00',
    modality: 'presencial',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Load appointments
  useEffect(() => {
    if (!isAuthenticated) return
    loadAppointments()
  }, [isAuthenticated, dateFilter, statusFilter])

  const loadAppointments = async () => {
    setLoadingAppts(true)
    try {
      const params = {}
      if (dateFilter) params.date = dateFilter
      if (statusFilter) params.status = statusFilter
      const data = await getAppointments(params)
      setAppointments(data)
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('inválido')) {
        logout()
        navigate('/login')
      }
    } finally {
      setLoadingAppts(false)
    }
  }

  const handleCancelAppt = async (id) => {
    if (!window.confirm('¿Cancelar esta cita? Se notificará al paciente por correo.')) return
    try {
      await updateAppointmentStatus(id, 'cancelled')
      loadAppointments()
    } catch {}
  }

  // Load schedules
  useEffect(() => {
    if (!isAuthenticated || tab !== 'schedules') return
    loadSchedules()
  }, [isAuthenticated, tab])

  const loadSchedules = async () => {
    setLoadingSched(true)
    try {
      const data = await getSchedules()
      setSchedules(data)
    } catch {}
    setLoadingSched(false)
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    try {
      await createSchedule({
        ...newSchedule,
        start_time: newSchedule.start_time + ':00',
        end_time: newSchedule.end_time + ':00',
      })
      loadSchedules()
    } catch {}
  }

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('¿Eliminar este bloque horario?')) return
    try {
      await deleteSchedule(id)
      loadSchedules()
    } catch {}
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Panel Admin</h1>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('appointments')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'appointments' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Citas
          </button>
          <button
            onClick={() => setTab('schedules')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'schedules' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Horarios
          </button>
        </div>

        {/* APPOINTMENTS TAB */}
        {tab === 'appointments' && (
          <div>
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos</option>
                <option value="confirmed">Confirmadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            {loadingAppts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay citas para mostrar.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onCancel={handleCancelAppt}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCHEDULES TAB */}
        {tab === 'schedules' && (
          <div>
            {/* Add schedule form */}
            <form onSubmit={handleAddSchedule} className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Agregar bloque horario</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Día</label>
                  <select
                    value={newSchedule.day_of_week}
                    onChange={e => setNewSchedule(s => ({ ...s, day_of_week: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {DAY_NAMES.map((name, i) => (
                      <option key={i} value={i}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Modalidad</label>
                  <select
                    value={newSchedule.modality}
                    onChange={e => setNewSchedule(s => ({ ...s, modality: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={e => setNewSchedule(s => ({ ...s, start_time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={e => setNewSchedule(s => ({ ...s, end_time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-3 w-full bg-emerald-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
              >
                Agregar
              </button>
            </form>

            {/* Schedule list */}
            {loadingSched ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              </div>
            ) : schedules.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No hay horarios configurados.</p>
            ) : (
              <div className="space-y-2">
                {schedules.map(sch => (
                  <div key={sch.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{DAY_NAMES[sch.day_of_week]}</p>
                      <p className="text-sm text-gray-500">
                        {sch.start_time.slice(0, 5)} — {sch.end_time.slice(0, 5)} · {sch.modality}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sch.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {sch.active ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
