import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [idNumber, setIdNumber] = useState('ADMIN001')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const onSubmit = async e => {
    e.preventDefault()
    try { await login(idNumber, password); navigate('/dashboard') }
    catch (err) { setError(err?.response?.data?.error || 'Login failed') }
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm border p-6 rounded space-y-4">
        <div className="text-xl font-semibold">Login</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input className="w-full border p-2 rounded" placeholder="ID Number" value={idNumber} onChange={e=>setIdNumber(e.target.value)} />
        <input type="password" className="w-full border p-2 rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-black text-white py-2 rounded">Sign In</button>
      </form>
    </div>
  )
}
