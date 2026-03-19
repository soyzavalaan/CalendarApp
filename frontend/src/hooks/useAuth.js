import { useState, useEffect, useCallback } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, isConfigured } from '../lib/firebase'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isAuthenticated = !!token

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken()
        localStorage.setItem('token', idToken)
        setToken(idToken)
        setUser(firebaseUser)
      } else {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email, password) => {
    if (!isConfigured) {
      setError('Firebase no está configurado')
      throw new Error('Firebase no está configurado')
    }
    setLoading(true)
    setError(null)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await cred.user.getIdToken()
      localStorage.setItem('token', idToken)
      setToken(idToken)
      setUser(cred.user)
    } catch (e) {
      const msg = e.code === 'auth/invalid-credential'
        ? 'Credenciales inválidas'
        : e.message
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (isConfigured) await signOut(auth)
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  return { user, token, isAuthenticated, loading, error, login, logout }
}
