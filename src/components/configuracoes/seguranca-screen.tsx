import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldCheck, AlertTriangle, Monitor, KeyRound } from 'lucide-react'
import { getActiveSessions, getLoginAttempts } from '@/services/configuracoes'
import { getMfaStatus } from '@/services/mfa'
import { MfaEnrollmentDialog } from '@/components/mfa-enrollment-dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

export function SegurancaScreen() {
  const { isAdmin } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mfaStatus, setMfaStatus] = useState<{ enabled: boolean; has_secret: boolean } | null>(null)
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [sess, att, mfa] = await Promise.all([
        getActiveSessions(),
        getLoginAttempts(),
        getMfaStatus().catch(() => null),
      ])
      setSessions((sess as any).items || [])
      setAttempts((att as any).items || [])
      if (mfa) setMfaStatus({ enabled: mfa.enabled, has_secret: mfa.has_secret })
    } catch {
      setSessions([])
      setAttempts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('audit_sessions', () => load())

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-foreground flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#005B2E]" /> Segurança
      </h2>
      {isAdmin && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-[#005B2E]" />
                <div>
                  <h3 className="font-bold text-sm">Autenticação de Dois Fatores (MFA)</h3>
                  <p className="text-xs text-muted-foreground">
                    {mfaStatus?.enabled
                      ? 'MFA ativo — sua conta está protegida com segunda camada de segurança.'
                      : 'MFA não configurado — proteja sua conta de administrador.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mfaStatus && (
                  <Badge
                    className={
                      mfaStatus.enabled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {mfaStatus.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                )}
                <Button
                  size="sm"
                  onClick={() => setMfaDialogOpen(true)}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                >
                  {mfaStatus?.enabled ? 'Gerenciar' : 'Configurar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <MfaEnrollmentDialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen} onSuccess={load} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#005B2E]" /> Sessões Ativas
            </h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma sessão ativa.
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.user_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.browser || '—'} · {s.os || '—'} · {s.ip_address || '—'}
                      </p>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold">Ativo</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Tentativas de Login
            </h3>
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma tentativa registrada.
              </p>
            ) : (
              <div className="space-y-2">
                {attempts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {a.user_name || a.target_summary || '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.created ? new Date(a.created).toLocaleString('pt-BR') : '—'}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold ${a.action === 'login' ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {a.action === 'login' ? 'Sucesso' : 'Falha'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
