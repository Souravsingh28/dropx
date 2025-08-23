import { createContext, useContext, useState } from 'react'
import api from '../lib/api'
const AuthCtx = createContext()
export const useAuth = () => useContext(AuthCtx)
export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const login = async (id_number, password) => {
    const { data } = await api.post('/auth/login', { id_number, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
