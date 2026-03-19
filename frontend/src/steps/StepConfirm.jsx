export default function StepConfirm({ selected, onUpdatePatient, onSubmit, loading, error }) {
  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  const canSubmit =
    selected.patient.name.trim() &&
    selected.patient.email.trim() &&
    selected.patient.phone.trim()

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Confirma tu cita</h2>

      {/* Resumen */}
      <div className="bg-emerald-50 rounded-xl p-4 mb-4 text-sm space-y-1">
        <p><span className="text-gray-500">Servicio:</span> <strong>{selected.service.name}</strong></p>
        <p><span className="text-gray-500">Duración:</span> {selected.service.duration_min} min</p>
        {Number(selected.service.price) > 0 && (
          <p><span className="text-gray-500">Precio:</span> ${Number(selected.service.price).toLocaleString('es-MX')} MXN</p>
        )}
        <p><span className="text-gray-500">Fecha:</span> {formatDate(selected.date)}</p>
        <p><span className="text-gray-500">Hora:</span> {selected.time}</p>
      </div>

      {/* Datos del paciente */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input
            type="text"
            value={selected.patient.name}
            onChange={e => onUpdatePatient('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Tu nombre completo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
          <input
            type="email"
            value={selected.patient.email}
            onChange={e => onUpdatePatient('email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
          <input
            type="tel"
            value={selected.patient.phone}
            onChange={e => onUpdatePatient('phone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="55 1234 5678"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className="w-full mt-4 bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Agendando...' : 'Confirmar cita'}
      </button>
    </div>
  )
}
