import { useState, useEffect, useMemo } from 'react'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function Calendar({ availability, onSelectDate, selectedDate, onMonthChange }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  useEffect(() => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    onMonthChange(key)
  }, [year, month, onMonthChange])

  const availableSet = useMemo(() => {
    const set = new Set()
    availability.forEach(d => { if (d.available) set.add(d.date) })
    return set
  }, [availability])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const isPrevDisabled = year === today.getFullYear() && month <= today.getMonth()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <h3 className="font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isAvailable = availableSet.has(dateStr)
          const isSelected = selectedDate === dateStr
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

          return (
            <button
              key={dateStr}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              disabled={!isAvailable || isPast}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                ${isSelected
                  ? 'bg-emerald-600 text-white font-bold'
                  : isAvailable
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
