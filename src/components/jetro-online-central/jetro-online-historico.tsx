import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { History, Search, ShieldAlert, Calendar, User, Eye, FileText, Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function JetroOnlineHistoricoScreen() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('audit_logs').getList(1, 50, {
        filter: 'module = "HURAM On-line" || module = "Jetro On-line"',
        sort: '-created',
      })
      setLogs(records.items)
    } catch {
      toast({ title: 'Erro ao consultar auditoria de conversas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = logs.filter((l) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (l.user_name && l.user_name.toLowerCase().includes(q)) ||
      (l.target_summary && l.target_summary.toLowerCase().includes(q)) ||
      (l.ip_address && l.ip_address.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#005B2E]" />
                Histórico e Auditoria Administrativa de Conversas
              </CardTitle>
              <CardDescription className="text-xs">
                Acesso estritamente restrito para auditoria, suporte técnico e conformidade com a
                LGPD.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Privacidade Ativa (LGPD)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuário, pergunta resumida ou IP..."
              className="pl-9 text-xs h-9"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Carregando auditoria...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-lg">
              Nenhum registro de interação recente localizado.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden divide-y text-xs">
              {filtered.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-[#005B2E]" />
                        {l.user_name || 'Operador'}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {l.user_role || 'PADRÃO'}
                      </Badge>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(l.created).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-700 font-mono text-[11px] truncate">
                      "{l.target_summary}"
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span>IP: {l.ip_address || '127.0.0.1'}</span>
                      <span>Origem: {l.origem || 'Inteligência Artificial'}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLog(l)
                      setDetailOpen(true)
                    }}
                    className="h-8 text-xs shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Auditar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalhes de Auditoria */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#005B2E]" />
              Auditoria de Consulta — HURAM On-line
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border space-y-1">
                <p>
                  <strong>Usuário:</strong> {selectedLog.user_name}
                </p>
                <p>
                  <strong>Perfil de Acesso:</strong> {selectedLog.user_role}
                </p>
                <p>
                  <strong>Data/Hora:</strong>{' '}
                  {new Date(selectedLog.created).toLocaleString('pt-BR')}
                </p>
                <p>
                  <strong>Endereço IP:</strong> {selectedLog.ip_address}
                </p>
                <p>
                  <strong>Navegador / User-Agent:</strong>{' '}
                  <span className="font-mono text-[10px] break-all">{selectedLog.user_agent}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-gray-700">Pergunta Auditada:</span>
                <p className="bg-white p-3 rounded-lg border font-mono text-gray-800 leading-relaxed">
                  {selectedLog.target_summary}
                </p>
              </div>

              <div className="p-2.5 bg-blue-50 text-blue-900 rounded border border-blue-200 text-[11px]">
                Registro mantido em conformidade com o Art. 16 da LGPD e as normas de governança
                interna do ERP HURAM.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
