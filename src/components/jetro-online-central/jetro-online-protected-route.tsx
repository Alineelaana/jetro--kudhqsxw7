import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { canManageJetroOnline } from '@/lib/permissions'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert } from 'lucide-react'

interface JetroOnlineProtectedRouteProps {
  children: React.ReactNode
}

export function JetroOnlineProtectedRoute({ children }: JetroOnlineProtectedRouteProps) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const user = pb.authStore.record
  const userRole = (user as any)?.role
  const isAllowed = canManageJetroOnline(userRole)

  useEffect(() => {
    if (!isAllowed) {
      toast({
        title: 'Acesso Restrito',
        description:
          'Você não possui permissão administrativa para acessar as Configurações do Jetro On-line.',
        variant: 'destructive',
      })
      navigate('/admin', { replace: true })
    }
  }, [isAllowed, navigate, toast])

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[400px]">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-xs text-gray-500 max-w-sm">
          A Central de Configurações do Jetro On-line é restrita a administradores e supervisores do
          ERP.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
