import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { checkProfileScreenAccess } from '@/lib/profile-permissions'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert, Loader2 } from 'lucide-react'

interface JehProtectedRouteProps {
  children: React.ReactNode
}

export function JehProtectedRoute({ children }: JehProtectedRouteProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userRole, loading } = useAuth()

  const isSup = userRole?.toUpperCase() === 'SUP'
  const isAllowed = isSup || checkProfileScreenAccess(userRole, '/admin/jeh', 'v')

  useEffect(() => {
    if (!loading && !isAllowed) {
      toast({
        title: 'Acesso Restrito pelo Perfil',
        description: 'Seu perfil de acesso não possui permissão para acessar a Central da Jeh.',
        variant: 'destructive',
      })
      navigate('/admin', { replace: true })
    }
  }, [loading, isAllowed, navigate, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#063D30] animate-spin" />
      </div>
    )
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-xs text-gray-500 max-w-sm">
          A Central de Administração e Treinamento da Assistente Jeh é restrita a administradores e
          supervisores. Redirecionando...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
