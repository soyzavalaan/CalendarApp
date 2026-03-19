import useBooking from '../hooks/useBooking'
import ProgressBar from '../components/ProgressBar'
import StepService from '../steps/StepService'
import StepDate from '../steps/StepDate'
import StepTime from '../steps/StepTime'
import StepConfirm from '../steps/StepConfirm'

export default function BookingPage() {
  const b = useBooking()

  function formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  // Pantalla de éxito
  if (b.step === 4 && b.result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">¡Cita agendada!</h1>
          <p className="text-gray-600 text-sm mb-4">
            Hemos enviado un correo de confirmación a <strong>{b.result.patient_email}</strong> con los detalles y el enlace de cancelación.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-1 mb-4">
            <p><span className="text-gray-500">Servicio:</span> <strong>{b.result.service_name}</strong></p>
            <p><span className="text-gray-500">Fecha:</span> {formatDate(b.result.appointment_date)}</p>
            <p><span className="text-gray-500">Hora:</span> {b.result.appointment_time.slice(0, 5)}</p>
            <p><span className="text-gray-500">Modalidad:</span> {b.result.modality}</p>
            {b.result.payment_token && (
              <p><span className="text-gray-500">Token de pago:</span> <strong className="font-mono text-emerald-700">{b.result.payment_token}</strong></p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-emerald-600 font-medium hover:underline text-sm"
          >
            Agendar otra cita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Agendar Cita
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-5">
          <ProgressBar current={b.step} />

          {b.step > 0 && b.step < 4 && (
            <button
              onClick={b.goBack}
              className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1"
            >
              ← Regresar
            </button>
          )}

          {b.step === 0 && (
            <StepService
              services={b.services}
              onSelect={b.selectService}
              loading={b.loading}
              onLoad={b.loadServices}
            />
          )}

          {b.step === 1 && (
            <StepDate
              availability={b.availability}
              selectedDate={b.selected.date}
              onSelectDate={b.selectDate}
              onMonthChange={b.loadAvailability}
              loading={b.loading}
            />
          )}

          {b.step === 2 && (
            <StepTime
              date={b.selected.date}
              slots={b.slots}
              selectedTime={b.selected.time}
              onSelectTime={b.selectTime}
              loading={b.loading}
              onLoad={b.loadSlots}
            />
          )}

          {b.step === 3 && (
            <StepConfirm
              selected={b.selected}
              onUpdatePatient={b.updatePatient}
              onSetModality={b.setModality}
              onSubmit={b.submitAppointment}
              loading={b.loading}
              error={b.error}
            />
          )}

          {b.error && b.step < 3 && (
            <div className="mt-3 bg-red-50 text-red-700 text-sm rounded-lg p-3">
              {b.error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
