import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { checkProfileScreenAccess } from '@/lib/profile-permissions'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert, Loader2 } from 'lucide-react'

interface AiAdminProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Guarda de rota para rotas administrativas de Inteligência Artificial.
 * Permissão avaliada via checkProfileScreenAccess e perfil SUP.
 * Redireciona com mensagem de acesso restrito (sem crash) ao tentar acesso direto por URL.
 */
export function AiAdminProtectedRoute({ children }: AiAdminProtectedRouteProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userRole, loading } = useAuth()

  const isSup = userRole?.toUpperCase() === 'SUP'
  const isAllowed = isSup || checkProfileScreenAccess(userRole, '/admin/ia', 'v')

  useEffect(() => {
    if (!loading && !isAllowed) {
      toast({
        title: 'Acesso Restrito pelo Perfil',
        description:
          'Seu perfil de acesso não possui permissão para acessar esta área de Inteligência Artificial.',
        variant: 'destructive',
      })
      navigate('/admin', { replace: true })
    }
  }, [loading, isAllowed, navigate, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Acesso Restrito</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          Esta tela de administração de IA é restrita exclusivamente ao perfil SUP.
          Redirecionando...
        </p>
      </div>
    )
  }

  return <>{children}</>
}
