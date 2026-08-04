import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  getCorrections,
  createCorrection,
  updateCorrection,
  logFiscalAudit,
} from '@/services/fiscal'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { CORRECTION_STATUS, STATUS_COLORS } from '@/lib/fiscal-types'
import { Loader2, FileText, Search, Send, Check } from 'lucide-react'
import { toast } from 'sonner'

export function CartaCorrecao() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [correctionText, setCorrectionText] = useState('')
  const [notaNumero, setNotaNumero] = useState('')

  const load = async () => {
    try {
      setRecords(await getCorrections())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('fiscal_corrections', () => load())

  const filtered = records.filter(
    (r) =>
      !search ||
      (r.nota_numero as string)?.includes(search) ||
      (r.nota_cliente as string)?.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = async () => {
    if (!notaNumero || !correctionText.trim()) {
      toast.error('Número da nota e correção são obrigatórios')
      return
    }
    try {
      const userName = (user?.name as string) || 'Sistema'
      await createCorrection({
        nota_numero: notaNumero,
        correcao_texto: correctionText,
        status: 'Autorizada',
        protocolo: String(Date.now()),
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: userName,
      })
      logFiscalAudit(
        'create',
        'fiscal_corrections',
        '',
        `Carta de Correção para nota ${notaNumero}`,
      )
      toast.success('Carta de Correção emitida')
      setNotaNumero('')
      setCorrectionText('')
      load()
    } catch {
      toast.error('Erro ao emitir carta')
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
      <h3 className="text-lg font-bold">Carta de Correção</h3>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Número da Nota *</Label>
              <Input
                value={notaNumero}
                onChange={(e) => setNotaNumero(e.target.value)}
                placeholder="Ex: 123"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Correção *</Label>
            <Textarea
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              rows={3}
              placeholder="Descreva a correção..."
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
            <Send className="w-4 h-4 mr-2" /> Emitir Carta de Correção
          </Button>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nota ou cliente..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma carta de correção encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nota</th>
                  <th className="text-left px-3 py-3 font-bold">Correção</th>
                  <th className="text-left px-3 py-3 font-bold">Protocolo</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-mono font-bold text-[#C89B3C]">
                      {(r.nota_numero as string) || '—'}
                    </td>
                    <td className="px-3 py-3 text-xs max-w-xs truncate">
                      {(r.correcao_texto as string) || '—'}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono">
                      {(r.protocolo as string)?.slice(0, 15) || '—'}...
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status as string] || ''}`}
                      >
                        {r.status as string}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {r.created ? new Date(r.created as string).toLocaleDateString('pt-BR') : '—'}
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
