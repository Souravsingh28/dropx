import { useAuth } from '../context/AuthContext'
export default function RoleGate({ roles, children }){ const { user } = useAuth(); if (!user) return null; return roles.includes(user.role) ? children : <div className="p-4">No access</div> }
