import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCommunications, sendParcial } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canSendCommunications } from '@/lib/variable-remuneration-permissions'
import { Loader2, Send, Mail, Users } from 'lucide-react'
import { toast } from 'sonner'

export function VrCommunications() {
  const { user } = useAuth()
  const [comms, setComms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [targetScope, setTargetScope] = useState('todos')
  const [competencia, setCompetencia] = useState('')

  const load = async () => {
    try {
      setComms(await getCommunications())
    } catch {
      setComms([])
    }
    setLoading(false)
  }
  useEffect(() => {
    const now = new Date()
    setCompetencia(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    load()
  }, [])
  useRealtime('goal_communications', () => load())

  const handleSend = async (scope: string) => {
    if (!competencia) {
      toast.error('Competência é obrigatória')
      return
    }
    setSending(true)
    try {
      await sendParcial(scope, '', competencia)
      toast.success('Parcial enviada com sucesso')
      load()
    } catch {
      toast.error('Erro ao enviar parcial')
    }
    setSending(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Comunicações — Parcial de Metas</h3>
      {canSendCommunications(user?.role) && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-3">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Competência</label>
                <input
                  type="month"
                  value={competencia}
                  onChange={(e) => setCompetencia(e.target.value)}
                  className="h-9 rounded-md border border-input px-3 text-sm focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Escopo</label>
                <Select value={targetScope} onValueChange={setTargetScope}>
                  <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Vendedores</SelectItem>
                    <SelectItem value="equipe">Equipe</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="regiao">Região</SelectItem>
                    <SelectItem value="filial">Filial</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => handleSend(targetScope)}
                disabled={sending}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}{' '}
                ENVIAR PARCIAL DE METAS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Data</th>
                <th className="text-left px-3 py-3 font-bold">Enviado por</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Vendedor</th>
                <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Competência</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {comms.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-3 text-xs">
                    {c.created ? new Date(c.created).toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-3">{c.sent_by || '—'}</td>
                  <td className="px-3 py-3 hidden sm:table-cell">
                    {c.vendedor_name || c.sent_to || '—'}
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">{c.competencia || '—'}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${c.send_status === 'enviado' ? 'bg-emerald-100 text-emerald-700' : c.send_status === 'falhou' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {c.send_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
