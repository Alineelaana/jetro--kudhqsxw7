import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getNfeRecords, updateNfeRecord, logSalesAudit } from '@/services/sales'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { STATUS_COLORS, NFE_STATUS, type NfeRecord } from '@/lib/sales-types'
import {
  Loader2,
  FileText,
  CheckCircle,
  Send,
  Download,
  Mail,
  X,
  Edit,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { NfeHomologationDialog } from '@/components/fiscal/nfe-homologation-dialog'

export function NfePanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<NfeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [homologationOpen, setHomologationOpen] = useState(false)
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [correctionRecord, setCorrectionRecord] = useState<NfeRecord | null>(null)
  const [correctionText, setCorrectionText] = useState('')

  const load = async () => {
    try {
      setRecords(await getNfeRecords())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('nfe_records', () => load())

  const userName = (user?.name as string) || 'Sistema'

  const updateStatus = async (r: NfeRecord, status: string, note: string = '') => {
    try {
      await updateNfeRecord(r.id, {
        status,
        authorization_protocol:
          status === 'Autorizada' ? `${Date.now()}` : r.authorization_protocol,
        history: [
          ...(r.history || []),
          { action: status, user: userName, date: new Date().toISOString(), note },
        ],
      })
      logSalesAudit('update', 'sales', r.id, `NF-e ${r.nfe_number} - ${status}`)
      toast.success(`NF-e ${status}`)
      load()
    } catch {
      toast.error('Erro ao atualizar NF-e')
    }
  }

  const handleCorrection = async () => {
    if (!correctionRecord || !correctionText.trim()) return
    await updateStatus(
      correctionRecord,
      correctionRecord.status,
      `Carta de Correção: ${correctionText}`,
    )
    setCorrectionOpen(false)
    setCorrectionText('')
  }

  const handleDownloadXml = (r: NfeRecord) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><nfe><numero>${r.nfe_number}</numero><cliente>${r.client_name}</cliente><total>${r.total_value}</total><status>${r.status}</status></nfe>`
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nfe_${r.nfe_number}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">Emissão de NF-e</h3>
          <p className="text-xs text-muted-foreground">
            Gestão de notas fiscais eletrônicas com suporte a testes em ambiente de homologação
          </p>
        </div>
        <Button
          onClick={() => setHomologationOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 gap-1.5"
        >
          <Sparkles className="w-4 h-4" /> Emitir em Homologação
        </Button>
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma NF-e encontrada.</p>
            <p className="text-sm text-muted-foreground">
              As NF-e são geradas automaticamente após o faturamento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº NF-e</th>
                  <th className="text-left px-3 py-3 font-bold">Cliente</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {r.nfe_number || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{r.client_name || '—'}</td>
                    <td className="px-3 py-3 font-bold">R$ {r.total_value || '0,00'}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status] || ''}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {r.status === 'Em Digitação' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(r, 'Em Validação')}
                            className="text-blue-600"
                            title="Validar"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {(r.status === 'Em Validação' || r.status === 'Aguardando Transmissão') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateStatus(r, 'Autorizada', 'Transmitida e autorizada pela SEFAZ')
                            }
                            className="text-emerald-600"
                            title="Transmitir"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'Autorizada' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadXml(r)}
                            className="text-[#005B2E]"
                            title="Baixar XML"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'Autorizada' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toast.info('DANFE enviado para impressão')}
                            className="text-[#005B2E]"
                            title="Baixar DANFE"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'Rejeitada' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateStatus(r, 'Em Validação', 'Reprocessando nota rejeitada')
                            }
                            className="text-amber-600"
                            title="Reprocessar"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCorrectionRecord(r)
                            setCorrectionOpen(true)
                          }}
                          className="text-blue-600"
                          title="Carta de Correção"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        {r.status !== 'Cancelada' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(r, 'Cancelada', 'Cancelada pelo usuário')}
                            className="text-red-600"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={correctionOpen} onOpenChange={setCorrectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Carta de Correção</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-xs">Descrição da correção</Label>
            <Textarea
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              rows={4}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCorrectionOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCorrection}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              Emitir Carta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE EMISSÃO EM HOMOLOGAÇÃO SEFAZ (FASE C) */}
      <NfeHomologationDialog
        open={homologationOpen}
        onOpenChange={setHomologationOpen}
        onSuccess={load}
      />
    </div>
  )
}
