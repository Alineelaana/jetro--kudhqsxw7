import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import LoginPage from '@/pages/Login'

export function RootRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] w-full p-8">
        <div className="w-7 h-7 rounded-full border-2 border-[#063D30] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return <LoginPage />
}

export default RootRoute
