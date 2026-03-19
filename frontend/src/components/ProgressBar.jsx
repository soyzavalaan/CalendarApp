const STEPS = ['Servicio', 'Fecha', 'Horario', 'Confirmar']

export default function ProgressBar({ current }) {
  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${i < current ? 'bg-emerald-500 text-white' :
                  i === current ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' :
                  'bg-gray-200 text-gray-500'}`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 ${i <= current ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mt-[-12px] ${i < current ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
