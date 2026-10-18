import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  canManageUsers,
  canViewUserPreciseCoords,
  canTerminateUserSessions,
  canExportUserAudit,
  canManageRetentionPolicy,
} from '@/lib/permissions'
import {
  type UserAuditRecord,
  type AuthEvent,
  type AuditSession,
  type AuditAlert,
  fetchUsersAuditOverview,
  fetchUserAuthHistory,
  fetchUserSessions,
  fetchUserAlerts,
} from '@/services/user-audit-service'
import { UsersTable } from '@/components/users/users-table'
import { UserDetailsScreen } from '@/components/users/user-details-screen'
import { RetentionPolicyDialog } from '@/components/users/retention-policy-dialog'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function UsersAdminPage() {
  const { userRole } = useAuth()
  const isAuthorized = canManageUsers(userRole)

  const [users, setUsers] = useState<UserAuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserAuditRecord | null>(null)

  // Dados do usuário selecionado para os detalhes
  const [userEvents, setUserEvents] = useState<AuthEvent[]>([])
  const [userSessions, setUserSessions] = useState<AuditSession[]>([])
  const [userAlerts, setUserAlerts] = useState<AuditAlert[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Diálogo de retenção
  const [retentionDialogOpen, setRetentionDialogOpen] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchUsersAuditOverview()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthorized) {
      loadUsers()
    }
  }, [isAuthorized, loadUsers])

  const handleSelectUser = async (userRecord: UserAuditRecord) => {
    setSelectedUser(userRecord)
    setLoadingDetails(true)
    try {
      const [eventsData, sessionsData, alertsData] = await Promise.all([
        fetchUserAuthHistory(userRecord.id, userRecord.email),
        fetchUserSessions(userRecord.id),
        fetchUserAlerts(userRecord.id),
      ])
      setUserEvents(eventsData)
      setUserSessions(sessionsData)
      setUserAlerts(alertsData)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleRefreshDetails = async () => {
    if (!selectedUser) return
    handleSelectUser(selectedUser)
  }

  // Proteção de acesso / URL
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 text-center">
        <div className="p-3 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 rounded-full">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Apenas administradores e supervisores (SUP) possuem autorização para acessar a Central de
          Usuários e Auditoria de Acessos.
        </p>
        <Button asChild variant="outline">
          <Link to="/admin">Voltar para o Painel</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {selectedUser ? (
        loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            <p className="text-xs text-muted-foreground">
              Carregando histórico completo de acessos...
            </p>
          </div>
        ) : (
          <UserDetailsScreen
            user={selectedUser}
            events={userEvents}
            sessions={userSessions}
            alerts={userAlerts}
            onBack={() => setSelectedUser(null)}
            onRefresh={handleRefreshDetails}
            canViewPreciseCoords={canViewPreciseCoords(userRole)}
            canTerminateSessions={canTerminateUserSessions(userRole)}
            canExport={canExportUserAudit(userRole)}
          />
        )
      ) : (
        <UsersTable
          users={users}
          loading={loading}
          onRefresh={loadUsers}
          onSelectUser={handleSelectUser}
          canExport={canExportUserAudit(userRole)}
          onOpenRetentionConfig={
            canManageRetentionPolicy(userRole) ? () => setRetentionDialogOpen(true) : undefined
          }
        />
      )}

      <RetentionPolicyDialog open={retentionDialogOpen} onOpenChange={setRetentionDialogOpen} />
    </div>
  )
}
export default UsersAdminPage
