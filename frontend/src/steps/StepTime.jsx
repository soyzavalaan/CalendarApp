import { useEffect } from 'react'
import TimeSlots from '../components/TimeSlots'

export default function StepTime({ date, slots, selectedTime, onSelectTime, loading, onLoad }) {
  useEffect(() => {
    if (date) onLoad(date)
  }, [date, onLoad])

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Selecciona un horario</h2>
      <p className="text-sm text-gray-500 mb-4">📅 {formatDate(date)}</p>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <TimeSlots slots={slots} selectedTime={selectedTime} onSelectTime={onSelectTime} />
      )}
    </div>
  )
}
