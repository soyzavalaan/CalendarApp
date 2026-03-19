import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cancelAppointment } from '../lib/api'

export default function CancelPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleCancel = async () => {
    setStatus('loading')
    try {
      await cancelAppointment(token)
      setStatus('success')
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-red-600">Token de cancelación no proporcionado.</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Cita cancelada</h1>
          <p className="text-gray-600 text-sm">
            Tu cita ha sido cancelada exitosamente. Hemos enviado un correo de confirmación.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">¿Cancelar tu cita?</h1>
        <p className="text-gray-600 text-sm mb-4">
          Esta acción no se puede deshacer. Las cancelaciones deben realizarse con al menos 24 horas de anticipación.
        </p>

        {status === 'error' && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <a
            href="/"
            className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
          >
            Mantener mi cita
          </a>
          <button
            onClick={handleCancel}
            disabled={status === 'loading'}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  )
}
