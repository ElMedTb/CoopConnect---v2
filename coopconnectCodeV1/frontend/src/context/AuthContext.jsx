import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('access_token', data.accessToken)
    localStorage.setItem('refresh_token', data.refreshToken)
    const userData = {
      id: data.userId,
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authApi.register(data)
    const userData = {
      id: res.data.userId,
      username: res.data.username,
      email: res.data.email,
      fullName: res.data.fullName,
      role: res.data.role,
    }
    if (res.data.accessToken) {
      localStorage.setItem('access_token', res.data.accessToken)
      localStorage.setItem('refresh_token', res.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    }
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }, [])

  const isAuthenticated = !!user && !!localStorage.getItem('access_token')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
