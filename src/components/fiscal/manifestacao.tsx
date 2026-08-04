import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  getManifestations,
  createManifestation,
  updateManifestation,
  logFiscalAudit,
} from '@/services/fiscal'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { MANIFEST_TYPES, STATUS_COLORS } from '@/lib/fiscal-types'
import { Loader2, FileText, Search, Check, Eye, Download, Inbox } from 'lucide-react'
import { toast } from 'sonner'

const MANIFEST_LABELS: Record<string, string> = {
  Ciencia: 'Ciência da Operação',
  Confirmacao: 'Confirmação da Operação',
  Desconhecimento: 'Desconhecimento da Operação',
  Nao_Realizada: 'Operação não Realizada',
}

export function ManifestacaoDestinatario() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getManifestations())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('fiscal_manifestations', () => load())

  const filtered = records.filter(
    (r) =>
      !search ||
      (r.documento_numero as string)?.includes(search) ||
      (r.emitente as string)?.toLowerCase().includes(search.toLowerCase()),
  )
  const pending = records.filter((r) => !r.tipo_manifestacao)

  const handleManifest = async (r: Record<string, unknown>, tipo: string) => {
    try {
      await updateManifestation(r.id as string, {
        tipo_manifestacao: tipo,
        protocolo: String(Date.now()),
      })
      logFiscalAudit(
        'update',
        'fiscal_manifestations',
        r.id as string,
        `Manifestação: ${MANIFEST_LABELS[tipo]}`,
      )
      toast.success(`Manifestação: ${MANIFEST_LABELS[tipo]}`)
      load()
    } catch {
      toast.error('Erro ao manifestar')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Inbox className="w-5 h-5 text-[#005B2E]" /> Manifestação do Destinatário
      </h3>
      {pending.length > 0 && (
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="py-3">
            <span className="text-sm font-bold text-amber-700">
              {pending.length} documento(s) sem manifestação!
            </span>
          </CardContent>
        </Card>
      )}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nota ou emitente..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum documento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Documento</th>
                  <th className="text-left px-3 py-3 font-bold">Emitente</th>
                  <th className="text-left px-3 py-3 font-bold">Valor</th>
                  <th className="text-left px-3 py-3 font-bold">Manifestação</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {(r.documento_numero as string) || '—'}
                      </span>
                      <br />
                      <span className="text-[10px] text-muted-foreground">
                        {(r.documento_chave as string)?.slice(0, 25) || ''}...
                      </span>
                    </td>
                    <td className="px-3 py-3">{(r.emitente as string) || '—'}</td>
                    <td className="px-3 py-3 font-bold">R$ {(r.valor as string) || '0,00'}</td>
                    <td className="px-3 py-3">
                      {r.tipo_manifestacao ? (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                          {MANIFEST_LABELS[r.tipo_manifestacao as string]}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {!r.tipo_manifestacao &&
                          MANIFEST_TYPES.map((t) => (
                            <Button
                              key={t}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleManifest(r, t)}
                              className="text-[#005B2E] text-xs"
                              title={MANIFEST_LABELS[t]}
                            >
                              {t[0]}
                            </Button>
                          ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600"
                          title="Visualizar DANFE"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#005B2E]"
                          title="Baixar XML"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
