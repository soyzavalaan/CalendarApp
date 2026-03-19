import { useState, useCallback, useEffect, useRef } from 'react'
import { login as apiLogin } from '../lib/api'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export default function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const isAuthenticated = !!token

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (localStorage.getItem('token')) {
      timerRef.current = setTimeout(logout, SESSION_TIMEOUT)
    }
  }, [logout])

  useEffect(() => {
    if (!isAuthenticated) return
    resetTimer()
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, resetTimer])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiLogin(email, password)
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
      resetTimer()
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { token, isAuthenticated, loading, error, login, logout }
}
