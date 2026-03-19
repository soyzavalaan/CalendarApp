export default function TimeSlots({ slots, selectedTime, onSelectTime }) {
  if (slots.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">
        No hay horarios disponibles para este día.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map(slot => (
        <button
          key={slot.time}
          onClick={() => onSelectTime(slot.time)}
          className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors
            ${selectedTime === slot.time
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
        >
          {slot.label}
        </button>
      ))}
    </div>
  )
}
