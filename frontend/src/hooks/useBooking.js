import { useState, useCallback } from 'react'
import { getServices, getAvailability, getSlots, createAppointment } from '../lib/api'

export default function useBooking() {
  const [step, setStep] = useState(0)
  const [services, setServices] = useState([])
  const [availability, setAvailability] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const [selected, setSelected] = useState({
    service: null,
    date: null,
    time: null,
    modality: 'presencial',
    patient: { name: '', email: '', phone: '' },
  })

  const loadServices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getServices()
      setServices(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAvailability = useCallback(async (month) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAvailability(1, month, selected.service?.id)
      setAvailability(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [selected.service])

  const loadSlots = useCallback(async (date) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSlots(1, date, selected.service?.id)
      setSlots(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [selected.service])

  const submitAppointment = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await createAppointment({
        service_id: selected.service.id,
        patient_name: selected.patient.name,
        patient_email: selected.patient.email,
        patient_phone: selected.patient.phone,
        appointment_date: selected.date,
        appointment_time: selected.time + ':00',
        modality: selected.modality,
      })
      setResult(data)
      setStep(4) // success
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [selected])

  const selectService = (svc) => {
    setSelected(s => ({ ...s, service: svc }))
    setStep(1)
  }

  const selectDate = (date) => {
    setSelected(s => ({ ...s, date }))
    setStep(2)
  }

  const selectTime = (time) => {
    setSelected(s => ({ ...s, time }))
    setStep(3)
  }

  const updatePatient = (field, value) => {
    setSelected(s => ({ ...s, patient: { ...s.patient, [field]: value } }))
  }

  const setModality = (modality) => {
    setSelected(s => ({ ...s, modality }))
  }

  const goBack = () => {
    if (step > 0) setStep(step - 1)
  }

  return {
    step, setStep, services, availability, slots,
    loading, error, result, selected,
    loadServices, loadAvailability, loadSlots,
    selectService, selectDate, selectTime, setModality,
    updatePatient, submitAppointment, goBack,
  }
}
