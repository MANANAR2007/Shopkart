import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/customers/me')
                setAuthenticated(true)
            } catch {
                setAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <p className="text-sm text-slate-400 animate-pulse">
                    Loading...
                </p>
            </div>
        )
    }

    if (!authenticated) {
        return <Navigate to="/login" />
    }

    return children
}

export default ProtectedRoute
