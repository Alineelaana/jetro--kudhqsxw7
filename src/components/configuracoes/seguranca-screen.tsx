import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ShieldCheck, AlertTriangle, Monitor } from 'lucide-react'
import { getActiveSessions, getLoginAttempts } from '@/services/configuracoes'
import { useRealtime } from '@/hooks/use-realtime'

export function SegurancaScreen() {
  const [sessions, setSessions] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [sess, att] = await Promise.all([getActiveSessions(), getLoginAttempts()])
      setSessions((sess as any).items || [])
      setAttempts((att as any).items || [])
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
