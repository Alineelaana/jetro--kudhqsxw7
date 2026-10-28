import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, CheckCircle2, AlertTriangle, MapPin, Barcode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CollectorShellLayout } from './collector-shell-layout'
import { CollectorScannerField } from './collector-scanner-field'
import { useAuth } from '@/hooks/use-auth'
import {
  executeCollectorOperation,
  getLocalActiveShift,
  playAudioFeedback,
  triggerHapticFeedback,
} from '@/services/collector'

export const CollectorTransferScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fluxo em 3 etapas claras:
  // 1. Origem
  // 2. Produto/Lote + Quantidade
  // 3. Destino
  const [origem, setOrigem] = useState('')
  const [produtoScan, setProdutoScan] = useState('')
  const [lote, setLote] = useState('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [destino, setDestino] = useState('')
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleScanOrigem = (val: string) => {
    const trimmed = val.trim().toUpperCase()
    setOrigem(trimmed)
    triggerHapticFeedback('success')
    playAudioFeedback('success')
    setFeedback({
      type: 'success',
      message: `Origem confirmada: ${trimmed}. Bipar agora o item a ser transferido.`,
    })
  }

  const handleScanProduto = (val: string) => {
    const trimmed = val.trim()
    setProdutoScan(trimmed)
    triggerHapticFeedback('success')
    playAudioFeedback('success')
  }

  const handleScanDestino = (val: string) => {
    const trimmed = val.trim().toUpperCase()
    setDestino(trimmed)
    triggerHapticFeedback('success')
    playAudioFeedback('success')
  }

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origem.trim()) {
      setFeedback({ type: 'error', message: 'Informe a posição de origem!' })
      return
    }
    if (!produtoScan.trim()) {
      setFeedback({ type: 'error', message: 'Informe o código do produto/lote!' })
      return
    }
    if (!destino.trim()) {
      setFeedback({ type: 'error', message: 'Informe a posição de destino!' })
      return
    }
    if (origem.trim().toUpperCase() === destino.trim().toUpperCase()) {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: 'A posição de origem e destino não podem ser iguais!',
      })
      return
    }

    const shift = getLocalActiveShift()
    if (!shift && user?.role !== 'SUP') {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: 'Turno fechado! Abra o turno antes de realizar transferência.',
      })
      return
    }

    setIsSubmitting(true)

    const res = await executeCollectorOperation({
      tipo: 'transferencia',
      shift_id: shift?.id,
      dispositivo_codigo: shift?.dispositivo_codigo || 'COL-01',
      operador_id: user?.id || 'op',
      operador_nome: user?.name || user?.email,
      documento_referencia: 'TRANSF-WMS',
      produto_codigo: produtoScan.trim(),
      produto_nome: `Item: ${produtoScan.trim()}`,
      codigo_barras_lido: produtoScan.trim(),
      lote: lote.trim() || undefined,
      endereco_origem: origem.trim().toUpperCase(),
      endereco_destino: destino.trim().toUpperCase(),
      quantidade_esperada: Number(quantidade) || 1,
      quantidade_executada: Number(quantidade) || 1,
      divergencia: 0,
      status: 'concluido',
      idempotency_key: `trf_${origem}_${destino}_${produtoScan}_${Date.now()}`,
      empresa_id: user?.empresa_id,
      filial_id: user?.filial_id,
    })

    setIsSubmitting(false)

    if (res.success) {
      triggerHapticFeedback('success')
      playAudioFeedback('success')
      setFeedback({
        type: 'success',
        message: `Transferência concluída: ${quantidade} un movidas de ${origem} para ${destino}!`,
      })
      // Resetar dados para próxima movimentação
      setTimeout(() => {
        setProdutoScan('')
        setDestino('')
        setLote('')
        setQuantidade(1)
      }, 1400)
    } else {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: `Falha ao transferir: ${res.error}`,
      })
    }
  }

  return (
    <CollectorShellLayout
      title="Transferência de Endereço"
      subtitle="Movimentação Rápida entre Posições do Armazém"
      backRoute="/admin/coletor"
    >
      <div className="space-y-3 max-w-xl mx-auto py-1 pb-16">
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

        <form onSubmit={handleExecuteTransfer} className="space-y-3">
          {/* 1. Endereço Origem */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 space-y-2">
              <CollectorScannerField
                label="1. Posição de Origem (De onde sai)"
                placeholder="Ex: A-01-01..."
                value={origem}
                onChange={setOrigem}
                onScan={handleScanOrigem}
                autoFocus={!origem}
              />
            </CardContent>
          </Card>

          {/* 2. Produto, Lote e Quantidade */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 space-y-3">
              <CollectorScannerField
                label="2. Produto / Código de Barras / Lote"
                placeholder="Escaneie o item a transferir..."
                value={produtoScan}
                onChange={setProdutoScan}
                onScan={handleScanProduto}
                autoFocus={!!origem && !produtoScan}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="trfLote" className="text-xs uppercase text-slate-400">
                    Lote (opcional)
                  </Label>
                  <Input
                    id="trfLote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Ex: LT-2025"
                    className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="trfQtd" className="text-xs uppercase text-slate-400">
                    Quantidade
                  </Label>
                  <Input
                    id="trfQtd"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="h-11 font-mono text-lg font-bold bg-slate-950 border-slate-700 text-white mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Endereço Destino */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-3 space-y-2">
              <CollectorScannerField
                label="3. Posição de Destino (Para onde vai)"
                placeholder="Ex: B-02-04..."
                value={destino}
                onChange={setDestino}
                onScan={handleScanDestino}
                autoFocus={!!origem && !!produtoScan && !destino}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting || !origem.trim() || !produtoScan.trim() || !destino.trim()}
            className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>{isSubmitting ? 'Movendo...' : 'Confirmar Transferência'}</span>
          </Button>
        </form>
      </div>
    </CollectorShellLayout>
  )
}
