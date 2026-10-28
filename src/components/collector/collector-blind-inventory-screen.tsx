import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanBarcode, CheckCircle2, AlertTriangle, EyeOff, MapPin, ListPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CollectorShellLayout } from './collector-shell-layout'
import { CollectorScannerField } from './collector-scanner-field'
import { useAuth } from '@/hooks/use-auth'
import {
  executeCollectorOperation,
  getLocalActiveShift,
  playAudioFeedback,
  triggerHapticFeedback,
} from '@/services/collector'

interface CountRecord {
  id: string
  endereco: string
  codigoOuBarras: string
  nomeItem: string
  lote: string
  quantidade: number
  contagemNum: 1 | 2
  dataHora: string
}

export const CollectorBlindInventoryScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [contagemNum, setContagemNum] = useState<1 | 2>(1)
  const [inventarioId, setInventarioId] = useState<string>('INV-2025-01')
  const [endereco, setEndereco] = useState<string>('')
  const [itemBarcode, setItemBarcode] = useState<string>('')
  const [lote, setLote] = useState<string>('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [history, setHistory] = useState<CountRecord[]>([])
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Leitura do Endereço Físico
  const handleScanAddress = (code: string) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setEndereco(trimmed)
    triggerHapticFeedback('success')
    playAudioFeedback('success')
    setFeedback({
      type: 'success',
      message: `Posição selecionada: ${trimmed}. Agora leia os produtos presentes.`,
    })
  }

  // Leitura do Item / Código de Barras
  const handleScanItem = (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return
    setItemBarcode(trimmed)
    triggerHapticFeedback('success')
    playAudioFeedback('success')
  }

  // Registrar Contagem Cega (sem ver saldo do sistema)
  const handleSaveCount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!endereco.trim()) {
      setFeedback({ type: 'error', message: 'Escaneie ou digite o endereço antes de registrar!' })
      return
    }
    if (!itemBarcode.trim()) {
      setFeedback({ type: 'error', message: 'Escaneie o código de barras ou SKU do produto!' })
      return
    }

    const shift = getLocalActiveShift()
    if (!shift && user?.role !== 'SUP') {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: 'Turno fechado! Abra o turno do coletor para validar a contagem.',
      })
      return
    }

    setIsSubmitting(true)

    const res = await executeCollectorOperation({
      tipo: 'inventario',
      shift_id: shift?.id,
      dispositivo_codigo: shift?.dispositivo_codigo || 'COL-01',
      operador_id: user?.id || 'op',
      operador_nome: user?.name || user?.email,
      documento_referencia: inventarioId,
      produto_codigo: itemBarcode.trim(),
      produto_nome: `Item lido: ${itemBarcode.trim()}`,
      codigo_barras_lido: itemBarcode.trim(),
      lote: lote.trim() || 'GERAL',
      endereco_origem: endereco.trim().toUpperCase(),
      quantidade_executada: Number(quantidade) || 1,
      status: 'concluido',
      idempotency_key: `inv_${inventarioId}_${contagemNum}_${endereco}_${itemBarcode}_${Date.now()}`,
      metadata: {
        tipo_contagem: contagemNum === 1 ? '1ª Contagem Cega' : '2ª Contagem Cega',
        cego: true,
      },
      empresa_id: user?.empresa_id as string | undefined,
      filial_id: user?.filial_id as string | undefined,
    })
    setIsSubmitting(false)

    if (res.success) {
      triggerHapticFeedback('success')
      playAudioFeedback('success')
      const newRec: CountRecord = {
        id: `cnt-${Date.now()}`,
        endereco: endereco.trim().toUpperCase(),
        codigoOuBarras: itemBarcode.trim(),
        nomeItem: `Item ${itemBarcode.trim()}`,
        lote: lote.trim() || 'GERAL',
        quantidade: Number(quantidade) || 1,
        contagemNum,
        dataHora: new Date().toLocaleTimeString('pt-BR'),
      }
      setHistory([newRec, ...history])
      setFeedback({
        type: 'success',
        message: `Contagem salva: ${newRec.quantidade} un de ${newRec.codigoOuBarras} em ${newRec.endereco}.`,
      })
      // Resetar item e quantidade, mantém endereço para ler múltiplos itens da mesma posição
      setItemBarcode('')
      setLote('')
      setQuantidade(1)
    } else {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: `Erro ao gravar contagem: ${res.error}`,
      })
    }
  }

  return (
    <CollectorShellLayout
      title="Inventário Cego WMS"
      subtitle="1ª e 2ª Contagem Física sem Visualização de Saldo"
      backRoute="/admin/coletor"
    >
      <div className="space-y-3 pb-20 max-w-xl mx-auto">
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200'
                : feedback.type === 'warning'
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-200'
                  : 'bg-red-950/60 border-red-600/60 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Seleção do Ciclo de Contagem (1ª ou 2ª) */}
        <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase font-bold text-slate-300">Ciclo da Contagem:</span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setContagemNum(1)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                contagemNum === 1
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              1ª Contagem
            </button>
            <button
              type="button"
              onClick={() => setContagemNum(2)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                contagemNum === 2
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              2ª Contagem
            </button>
          </div>
        </div>

        {/* Formulário de Apontamento Cego */}
        <form onSubmit={handleSaveCount} className="space-y-3">
          {/* Passo 1: Endereço Físico */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 space-y-2">
              <CollectorScannerField
                label="Passo 1: Bipar Endereço / Posição"
                placeholder="Ex: A-01-02-B..."
                value={endereco}
                onChange={setEndereco}
                onScan={handleScanAddress}
                autoFocus={!endereco}
              />
              {endereco && (
                <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <MapPin className="h-3.5 w-3.5" /> {endereco}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEndereco('')}
                    className="text-slate-400 hover:text-white text-[11px] underline"
                  >
                    Trocar Endereço
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passo 2: Produto e Quantidade Contada */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 space-y-3">
              <CollectorScannerField
                label="Passo 2: Bipar Código de Barras / EAN do Produto"
                placeholder="Aponte o leitor para o item..."
                value={itemBarcode}
                onChange={setItemBarcode}
                onScan={handleScanItem}
                autoFocus={!!endereco}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="lote" className="text-xs uppercase text-slate-400">
                    Lote (opcional)
                  </Label>
                  <Input
                    id="lote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Ex: LT-2025"
                    className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="qtd" className="text-xs uppercase text-slate-400">
                    Quantidade Contada
                  </Label>
                  <Input
                    id="qtd"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="h-11 font-mono text-lg font-bold bg-slate-950 border-slate-700 text-white mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !endereco.trim() || !itemBarcode.trim()}
                className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2 mt-2"
              >
                <ListPlus className="h-5 w-5" />
                <span>{isSubmitting ? 'Gravando...' : 'Registrar Contagem'}</span>
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Histórico Recente desta Sessão */}
        {history.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs uppercase font-bold text-slate-400 px-1">
              Últimas Contagens Registradas ({history.length})
            </div>
            {history.map((h) => (
              <Card key={h.id} className="bg-slate-900 border-slate-800">
                <CardContent className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="font-mono text-emerald-400">{h.endereco}</span>
                      <span>-</span>
                      <span className="text-white">{h.codigoOuBarras}</span>
                      <Badge className="bg-slate-800 text-slate-300 text-[10px] py-0">
                        {h.contagemNum}ª C
                      </Badge>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Lote: {h.lote} | Hora: {h.dataHora}
                    </div>
                  </div>
                  <div className="text-base font-mono font-bold text-amber-400">
                    {h.quantidade} un
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CollectorShellLayout>
  )
}
