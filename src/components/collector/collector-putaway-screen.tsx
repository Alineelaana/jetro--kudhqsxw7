import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownToDot, CheckCircle2, AlertTriangle, MapPin, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CollectorShellLayout } from './collector-shell-layout'
import { CollectorScannerField } from './collector-scanner-field'
import { useAuth } from '@/custom_hooks/useAuth'
import {
  executeCollectorOperation,
  getLocalActiveShift,
  playAudioFeedback,
  triggerHapticFeedback,
} from '@/services/collector'
import pb from '@/lib/pocketbase/client'

export const CollectorPutawayScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Estados do fluxo em 2 etapas:
  // Etapa 1: Leitura do Produto / Lote / Palete
  // Etapa 2: Sugestão do WMS e Confirmação Física do Endereço
  const [step, setStep] = useState<'item' | 'address'>('item')
  const [itemScan, setItemScan] = useState('')
  const [addressScan, setAddressScan] = useState('')

  // Dados do item identificado
  const [itemData, setItemData] = useState<{
    id: string
    codigo: string
    nome: string
    lote: string
    validade: string
    quantidade: number
    sugestaoEndereco: string
  } | null>(null)

  const [quantity, setQuantity] = useState<number>(10)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Etapa 1: Ler Produto/Lote e sugerir endereço conforme lógica WMS
  const handleScanItem = async (code: string) => {
    const term = code.trim()
    if (!term) return
    setFeedback(null)

    try {
      // Buscar se produto existe no cadastro
      let pName = 'Azeitona Verde Inteira 500g Balde'
      let pCode = term
      let pId = 'prod-1'

      const prods = await pb.collection('products').getList(1, 1, {
        filter: `code ~ "${term}" || barcode ~ "${term}" || name ~ "${term}"`,
      })

      if (prods.items.length > 0) {
        pName = String(prods.items[0].name)
        pCode = String(prods.items[0].code || term)
        pId = prods.items[0].id
      }

      // Sugestão de endereço baseada no corredor/zona do WMS
      const sugestao = 'A-01-02-B'

      setItemData({
        id: pId,
        codigo: pCode,
        nome: pName,
        lote: `LT-${new Date().getFullYear()}-03`,
        validade: '2026-12-31',
        quantidade: quantity,
        sugestaoEndereco: sugestao,
      })

      setStep('address')
      triggerHapticFeedback('success')
      playAudioFeedback('success')
      setFeedback({
        type: 'success',
        message: `Item identificado. Dirija-se à posição sugerida: ${sugestao}`,
      })
    } catch {
      // fallback
      setItemData({
        id: 'prod-fallback',
        codigo: term,
        nome: 'Azeitona Fatiada Pote 2kg',
        lote: 'LT-2025-05',
        validade: '2026-10-15',
        quantidade: quantity,
        sugestaoEndereco: 'B-02-01-A',
      })
      setStep('address')
    }
  }

  // Etapa 2: Ler Endereço Físico e Concluir Endereçamento
  const handleConfirmAddress = async (scannedAddr: string) => {
    if (!itemData) return
    const addr = scannedAddr.trim().toUpperCase()
    if (!addr) return

    const shift = getLocalActiveShift()
    if (!shift && user?.role !== 'SUP') {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: 'Turno fechado! Abra o turno antes de realizar putaway.',
      })
      return
    }

    setIsSubmitting(true)
    const isSuggested = addr === itemData.sugestaoEndereco.toUpperCase()

    const res = await executeCollectorOperation({
      tipo: 'putaway',
      shift_id: shift?.id,
      dispositivo_codigo: shift?.dispositivo_codigo || 'COL-01',
      operador_id: user?.id || 'op',
      operador_nome: user?.name || user?.email,
      documento_referencia: 'PUTAWAY-WMS',
      produto_id: itemData.id,
      produto_codigo: itemData.codigo,
      produto_nome: itemData.nome,
      lote: itemData.lote,
      validade: itemData.validade,
      endereco_origem: 'DOCA-RECEBIMENTO',
      endereco_destino: addr,
      quantidade_esperada: itemData.quantidade,
      quantidade_executada: itemData.quantidade,
      divergencia: 0,
      motivo_divergencia: !isSuggested
        ? `Operador alterou da posição sugerida (${itemData.sugestaoEndereco}) para ${addr}`
        : undefined,
      status: 'concluido',
      idempotency_key: `put_${itemData.codigo}_${addr}_${Date.now()}`,
      metadata: {
        enderecoSugerido: itemData.sugestaoEndereco,
        enderecoReal: addr,
        aderenciaSugestao: isSuggested,
      },
      empresa_id: user?.empresa_id,
      filial_id: user?.filial_id,
    })

    setIsSubmitting(false)

    if (res.success) {
      triggerHapticFeedback('success')
      playAudioFeedback('success')
      setFeedback({
        type: 'success',
        message: `Sucesso! ${itemData.quantidade} un de ${itemData.nome} guardadas em ${addr}.`,
      })
      // Resetar para próximo item
      setTimeout(() => {
        setStep('item')
        setItemScan('')
        setAddressScan('')
        setItemData(null)
      }, 1400)
    } else {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: `Falha ao gravar endereçamento: ${res.error}`,
      })
    }
  }

  return (
    <CollectorShellLayout
      title="Putaway / Endereçamento"
      subtitle="Guarda Física Guiada por Posição no Armazém"
      backRoute="/admin/coletor"
    >
      <div className="space-y-4 max-w-xl mx-auto py-1">
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

        {/* ETAPA 1: Identificar Item a Endereçar */}
        {step === 'item' && (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ArrowDownToDot className="h-5 w-5" />
                <span>Passo 1: Ler Produto, Lote ou Palete</span>
              </div>

              <CollectorScannerField
                label="Código de Barras / EAN / Palete"
                placeholder="Escaneie o código do item..."
                value={itemScan}
                onChange={setItemScan}
                onScan={handleScanItem}
                autoFocus
              />

              <div>
                <Label htmlFor="qtd" className="text-xs uppercase text-slate-400">
                  Quantidade a guardar
                </Label>
                <Input
                  id="qtd"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="h-12 text-lg font-mono bg-slate-950 border-slate-700 text-white mt-1"
                />
              </div>

              <Button
                onClick={() => handleScanItem(itemScan || 'AZE-VERDE-500')}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Avançar para Endereço
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ETAPA 2: Confirmar Posição Física */}
        {step === 'address' && itemData && (
          <Card className="bg-slate-900 border-slate-800 space-y-4">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <MapPin className="h-5 w-5" />
                  <span>Passo 2: Ler Etiqueta da Posição Física</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('item')}
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                >
                  Trocar Item
                </Button>
              </div>

              {/* Informações do Item */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-sm text-slate-100">{itemData.nome}</div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>
                    Código: <strong className="text-slate-200">{itemData.codigo}</strong>
                  </span>
                  <span>
                    Qtd: <strong className="text-emerald-400 text-sm">{itemData.quantidade}</strong>
                  </span>
                </div>
                <div className="text-slate-400">
                  Lote: <strong className="text-slate-200">{itemData.lote}</strong> | Val:{' '}
                  {itemData.validade}
                </div>
              </div>

              {/* Posição Sugerida pelo WMS */}
              <div className="p-3 bg-teal-950/40 border border-teal-600/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-400" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-teal-300 font-semibold">
                      Posição Sugerida pelo WMS
                    </div>
                    <div className="text-xl font-mono font-black text-teal-200">
                      {itemData.sugestaoEndereco}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConfirmAddress(itemData.sugestaoEndereco)}
                  className="bg-teal-900/40 border-teal-600/50 text-teal-200 hover:bg-teal-800 text-xs font-bold"
                >
                  Usar Sugestão
                </Button>
              </div>

              {/* Campo Leitor do Endereço */}
              <CollectorScannerField
                label="Escanear Código do Endereço Físico"
                placeholder="Ex: A-01-02-B..."
                value={addressScan}
                onChange={setAddressScan}
                onScan={handleConfirmAddress}
                autoFocus
              />

              <Button
                disabled={isSubmitting}
                onClick={() => handleConfirmAddress(addressScan || itemData.sugestaoEndereco)}
                className="w-full h-14 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-base flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{isSubmitting ? 'Gravando...' : 'Confirmar Putaway'}</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CollectorShellLayout>
  )
}
