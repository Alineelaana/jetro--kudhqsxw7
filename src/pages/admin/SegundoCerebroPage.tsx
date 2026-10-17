import { Navigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { canViewSegundoCerebro } from '@/lib/permissions'
import { SegundoCerebroScreen } from '@/components/segundo-cerebro/segundo-cerebro-screen'

export default function SegundoCerebroPage() {
  const user = pb.authStore.record
  const role = user?.role as string | undefined

  if (!canViewSegundoCerebro(role)) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <SegundoCerebroScreen />
    </div>
  )
}
