const STATUS_COLORS = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5)
}

export default function AppointmentCard({ appointment, onCancel }) {
  const statusLabel = appointment.status === 'confirmed' ? 'Confirmada' : 'Cancelada'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{appointment.patient_name}</p>
          <p className="text-sm text-gray-500">{appointment.service_name || 'Servicio'}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[appointment.status] || 'bg-gray-100 text-gray-600'}`}>
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
        <span>📅 {formatDate(appointment.appointment_date)}</span>
        <span>🕐 {formatTime(appointment.appointment_time)}</span>
      </div>
      <div className="mt-1 text-sm text-gray-500">
        📧 {appointment.patient_email}
        {appointment.patient_phone && <span className="ml-3">📱 {appointment.patient_phone}</span>}
      </div>
      {appointment.status === 'confirmed' && onCancel && (
        <button
          onClick={() => onCancel(appointment.id)}
          className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Cancelar cita
        </button>
      )}
    </div>
  )
}
