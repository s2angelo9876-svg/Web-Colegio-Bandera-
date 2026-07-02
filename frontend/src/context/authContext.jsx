import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext()

function parseUserData(data) {
  if (!data) return null
  if (typeof data === 'object') return data
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function validateToken(token) {
  if (!token || typeof token !== 'string') return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp) {
      const isExpired = payload.exp * 1000 < Date.now()
      if (isExpired) return false
    }
    return true
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (token && validateToken(token) && usuarioGuardado) {
      const parsedUser = parseUserData(usuarioGuardado)
      if (parsedUser) {
        setUsuario(parsedUser)
      } else {
        logout()
      }
    } else if (token || usuarioGuardado) {
      logout()
    }

    setCargando(false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [logout])

  const login = useCallback((token, datosUsuario) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(datosUsuario))
    setUsuario(datosUsuario)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
