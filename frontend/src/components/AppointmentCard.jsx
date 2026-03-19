const STATUS_COLORS = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PAYMENT_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
}

const MODALITY_ICONS = {
  presencial: '🏥',
  virtual: '💻',
  híbrida: '🔄',
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5)
}

export default function AppointmentCard({ appointment, onCancel, onReschedule, onTogglePayment }) {
  const statusLabel = appointment.status === 'confirmed' ? 'Confirmada' : 'Cancelada'
  const paymentLabel = appointment.payment_status === 'paid' ? 'Pagado' : 'Pendiente'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{appointment.patient_name}</p>
          <p className="text-sm text-gray-500">{appointment.service_name || 'Servicio'}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[appointment.status] || 'bg-gray-100 text-gray-600'}`}>
            {statusLabel}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${PAYMENT_COLORS[appointment.payment_status] || 'bg-gray-100 text-gray-600'}`}>
            {paymentLabel}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
        <span>📅 {formatDate(appointment.appointment_date)}</span>
        <span>🕐 {formatTime(appointment.appointment_time)}</span>
        <span>{MODALITY_ICONS[appointment.modality] || '🏥'} {appointment.modality}</span>
      </div>
      <div className="mt-1 text-sm text-gray-500">
        📧 {appointment.patient_email}
        {appointment.patient_phone && <span className="ml-3">📱 {appointment.patient_phone}</span>}
      </div>
      {appointment.payment_token && (
        <div className="mt-1 text-xs text-gray-400">
          Token: <span className="font-mono">{appointment.payment_token}</span>
        </div>
      )}
      {appointment.status === 'confirmed' && (
        <div className="mt-3 flex gap-3">
          {onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cancelar
            </button>
          )}
          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              Reagendar
            </button>
          )}
          {onTogglePayment && (
            <button
              onClick={() => onTogglePayment(appointment.id, appointment.payment_status === 'paid' ? 'pending' : 'paid')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {appointment.payment_status === 'paid' ? 'Marcar pendiente' : 'Marcar pagado'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
