import { useEffect } from 'react'

export default function StepService({ services, onSelect, loading, onLoad }) {
  useEffect(() => { onLoad() }, [onLoad])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (services.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay servicios disponibles.</p>
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Selecciona un servicio</h2>
      {services.map(svc => (
        <button
          key={svc.id}
          onClick={() => onSelect(svc)}
          className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-md transition-all"
        >
          <p className="font-semibold text-gray-900">{svc.name}</p>
          {svc.description && <p className="text-sm text-gray-500 mt-1">{svc.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="text-emerald-700 font-medium">⏱ {svc.duration_min} min</span>
            {Number(svc.price) > 0 && (
              <span className="text-gray-600">${Number(svc.price).toLocaleString('es-MX')} MXN</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
