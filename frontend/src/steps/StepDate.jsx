import { useCallback } from 'react'
import Calendar from '../components/Calendar'

export default function StepDate({ availability, selectedDate, onSelectDate, onMonthChange, loading }) {
  const handleMonthChange = useCallback((month) => {
    onMonthChange(month)
  }, [onMonthChange])

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Selecciona una fecha</h2>
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
        </div>
      )}
      <Calendar
        availability={availability}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onMonthChange={handleMonthChange}
      />
    </div>
  )
}
