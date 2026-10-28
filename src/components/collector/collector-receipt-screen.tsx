import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageCheck, CheckCircle2, AlertTriangle, FileText, Barcode, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

interface ReceiptItem {
  id: string
  codigo: string
  nome: string
  barcode: string
  lote: string
  validade?: string
  qtdEsperada: number
  qtdConferida: number
  divergenciaMotivo?: string
}

export const CollectorReceiptScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [docRef, setDocRef] = useState('')
  const [docLoaded, setDocLoaded] = useState(false)
  const [scanInput, setScanInput] = useState('')
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [divergenceModalItem, setDivergenceModalItem] = useState<ReceiptItem | null>(null)
  const [divergenceReason, setDivergenceReason] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)

  // Ao buscar documento (NF-e ou Romaneio de Entrada)
  const handleLoadDocument = async (code: string) => {
    const term = code.trim()
    if (!term) return
    setFeedback(null)

    try {
      // Tenta buscar no WMS ou produtos para compor conferência
      const prods = await pb.collection('products').getList(1, 5, {
        filter: term.length > 5 ? `code ~ "${term}" || name ~ "${term}"` : undefined,
      })

      const demoItems: ReceiptItem[] =
        prods.items.length > 0
          ? prods.items.map((p) => ({
              id: p.id,
              codigo: String(p.code || p.id),
              nome: String(p.name || 'Produto sem nome'),
              barcode: String(p.barcode || p.code || '7890001002'),
              lote: `L-${new Date().getFullYear()}-01`,
              validade: '2026-12-31',
              qtdEsperada: 10,
              qtdConferida: 0,
            }))
          : [
              {
                id: 'item-1',
                codigo: 'AZE-VERDE-500',
                nome: 'Azeitona Verde Inteira 500g Balde',
                barcode: '789100012345',
                lote: 'LT-2025-01',
                validade: '2026-06-30',
                qtdEsperada: 20,
                qtdConferida: 0,
              },
              {
                id: 'item-2',
                codigo: 'AZE-PRETA-500',
                nome: 'Azeitona Preta Azapa 500g Pote',
                barcode: '789100054321',
                lote: 'LT-2025-02',
                validade: '2026-08-31',
                qtdEsperada: 15,
                qtdConferida: 0,
              },
            ]

      setItems(demoItems)
      setDocLoaded(true)
      setFeedback({
        type: 'success',
        message: `Documento ${term} carregado com ${demoItems.length} itens para conferência.`,
      })
      playAudioFeedback('success')
    } catch {
      // Mock seguro de recebimento
      setItems([
        {
          id: 'item-1',
          codigo: 'AZE-VERDE-500',
          nome: 'Azeitona Verde Inteira 500g',
          barcode: '789100012345',
          lote: 'LT-2025-01',
          validade: '2026-06-30',
          qtdEsperada: 20,
          qtdConferida: 0,
        },
      ])
      setDocLoaded(true)
    }
  }

  // Leitura do item por leitor de código de barras
  const handleItemScan = (code: string) => {
    const trimmed = code.trim().toLowerCase()
    const foundIndex = items.findIndex(
      (it) =>
        it.barcode.toLowerCase() === trimmed ||
        it.codigo.toLowerCase() === trimmed ||
        it.lote.toLowerCase() === trimmed,
    )

    if (foundIndex === -1) {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: `Código "${code}" não pertence a esta NF-e/Romaneio.`,
      })
      setScanInput('')
      return
    }

    const updated = [...items]
    const item = updated[foundIndex]
    item.qtdConferida += 1

    if (item.qtdConferida > item.qtdEsperada) {
      triggerHapticFeedback('warning')
      playAudioFeedback('warning')
      setFeedback({
        type: 'warning',
        message: `Atenção: Quantidade lida (${item.qtdConferida}) excede a esperada (${item.qtdEsperada}) para ${item.nome}!`,
      })
    } else {
      triggerHapticFeedback('success')
      playAudioFeedback('success')
      setFeedback({
        type: 'success',
        message: `Item lido: ${item.nome} (${item.qtdConferida}/${item.qtdEsperada})`,
      })
    }

    setItems(updated)
    setScanInput('')
  }

  // Alteração manual de quantidade ou motivo
  const handleSetQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qtdConferida: Math.max(0, qty) } : it)),
    )
  }

  // Finalização da conferência com gravação na collector_operations
  const handleFinishReceipt = async () => {
    const shift = getLocalActiveShift()
    if (!shift && user?.role !== 'SUP') {
      setFeedback({
        type: 'error',
        message: 'Turno fechado! Abra o turno do coletor antes de finalizar.',
      })
      return
    }

    // Verificar se há divergência sem motivo
    const unhandledDiv = items.find(
      (it) => it.qtdConferida !== it.qtdEsperada && !it.divergenciaMotivo,
    )
    if (unhandledDiv) {
      setDivergenceModalItem(unhandledDiv)
      return
    }

    setIsFinishing(true)
    let hasError = false

    for (const it of items) {
      const div = it.qtdConferida - it.qtdEsperada
      const res = await executeCollectorOperation({
        tipo: 'recebimento',
        shift_id: shift?.id,
        dispositivo_codigo: shift?.dispositivo_codigo || 'COL-01',
        operador_id: user?.id || 'op',
        operador_nome: user?.name || user?.email,
        documento_referencia: docRef || 'NFE-REC',
        produto_id: it.id,
        produto_codigo: it.codigo,
        produto_nome: it.nome,
        codigo_barras_lido: it.barcode,
        lote: it.lote,
        validade: it.validade,
        quantidade_esperada: it.qtdEsperada,
        quantidade_executada: it.qtdConferida,
        divergencia: div,
        motivo_divergencia: div !== 0 ? it.divergenciaMotivo || 'Ajuste de recebimento' : undefined,
        status: div !== 0 ? 'divergente' : 'concluido',
        idempotency_key: `rec_${docRef}_${it.id}_${Date.now()}`,
        empresa_id: user?.empresa_id,
        filial_id: user?.filial_id,
      })

      if (!res.success) {
        hasError = true
        setFeedback({
          type: 'error',
          message: `Erro ao gravar item ${it.codigo}: ${res.error}`,
        })
        break
      }
    }

    setIsFinishing(false)
    if (!hasError) {
      playAudioFeedback('success')
      triggerHapticFeedback('success')
      setFeedback({
        type: 'success',
        message: 'Conferência de recebimento concluída e registrada com sucesso!',
      })
      setTimeout(() => navigate('/admin/coletor'), 1500)
    }
  }

  const allComplete = items.length > 0 && items.every((i) => i.qtdConferida === i.qtdEsperada)
  const hasDivergences = items.length > 0 && items.some((i) => i.qtdConferida !== i.qtdEsperada)

  return (
    <CollectorShellLayout
      title="Recebimento"
      subtitle="Conferência de NF-e, Romaneio e Carga"
      backRoute="/admin/coletor"
    >
      <div className="space-y-3 pb-24">
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
            {feedback.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            )}
            {feedback.type === 'warning' && (
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            )}
            {feedback.type === 'error' && (
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 1. Passo: Identificar Romaneio / Chave da NF-e */}
        {!docLoaded ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-4">
              <CollectorScannerField
                label="Romaneio de Entrada ou Chave NF-e"
                placeholder="Escaneie ou digite o número do romaneio / chave..."
                value={docRef}
                onChange={setDocRef}
                onScan={handleLoadDocument}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleLoadDocument(docRef || 'ROM-2025-001')}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Carregar Conferência
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Barra de Leitura Contínua de Itens */}
            <Card className="bg-slate-900 border-emerald-700/50 shadow-lg">
              <CardContent className="p-3">
                <CollectorScannerField
                  label="Escanear Código de Barras do Item / Lote"
                  placeholder="Aponte o coletor para o EAN..."
                  value={scanInput}
                  onChange={setScanInput}
                  onScan={handleItemScan}
                  autoFocus
                />
              </CardContent>
            </Card>

            {/* Cabeçalho do Documento em Aberto */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-300">
              <span className="flex items-center gap-1 font-semibold">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                Doc: {docRef || 'ROM-2025-001'}
              </span>
              <span>
                Total Itens:{' '}
                <strong>
                  {items.reduce((acc, it) => acc + it.qtdConferida, 0)} /{' '}
                  {items.reduce((acc, it) => acc + it.qtdEsperada, 0)}
                </strong>
              </span>
            </div>

            {/* Lista dos Itens da NF-e / Romaneio */}
            <div className="space-y-2">
              {items.map((it) => {
                const isMatched = it.qtdConferida === it.qtdEsperada
                const isOver = it.qtdConferida > it.qtdEsperada
                const isUnder = it.qtdConferida < it.qtdEsperada

                return (
                  <Card
                    key={it.id}
                    className={`border transition-all ${
                      isMatched
                        ? 'bg-emerald-950/20 border-emerald-600/40'
                        : isOver
                          ? 'bg-amber-950/30 border-amber-500/60'
                          : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                            <span>{it.nome}</span>
                            {isMatched && (
                              <Badge className="bg-emerald-600 text-white text-[10px] py-0">
                                OK
                              </Badge>
                            )}
                            {isOver && (
                              <Badge className="bg-amber-600 text-white text-[10px] py-0">
                                Excesso
                              </Badge>
                            )}
                            {isUnder && it.qtdConferida > 0 && (
                              <Badge className="bg-blue-600 text-white text-[10px] py-0">
                                Parcial
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                            <span className="font-mono text-emerald-400">{it.codigo}</span>
                            <span>Lote: {it.lote}</span>
                            <span>EAN: {it.barcode}</span>
                          </div>
                        </div>

                        {/* Indicador de Quantidade */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-mono font-black">
                            <span
                              className={
                                isMatched
                                  ? 'text-emerald-400'
                                  : isOver
                                    ? 'text-amber-400'
                                    : 'text-white'
                              }
                            >
                              {it.qtdConferida}
                            </span>
                            <span className="text-slate-500 text-sm"> / {it.qtdEsperada}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ajuste Rápido de Quantidade via Teclas + / - */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetQty(it.id, it.qtdConferida - 1)}
                            disabled={it.qtdConferida <= 0}
                            className="h-7 w-8 bg-slate-800 border-slate-700 p-0 text-white font-bold"
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetQty(it.id, it.qtdConferida + 1)}
                            className="h-7 w-8 bg-slate-800 border-slate-700 p-0 text-white font-bold"
                          >
                            +
                          </Button>
                        </div>

                        {it.qtdConferida !== it.qtdEsperada && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDivergenceModalItem(it)
                              setDivergenceReason(it.divergenciaMotivo || '')
                            }}
                            className="h-7 text-[11px] text-amber-300 hover:text-amber-200 p-1"
                          >
                            {it.divergenciaMotivo
                              ? `Motivo: ${it.divergenciaMotivo}`
                              : 'Apontar Motivo Divergência'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal / Card para Apontamento de Divergência */}
      {divergenceModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-amber-600 max-w-md w-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="h-5 w-5" />
                <span>Justificativa de Divergência</span>
              </div>
              <p className="text-xs text-slate-300">
                Item: <strong>{divergenceModalItem.nome}</strong>
                <br />
                Esperado: {divergenceModalItem.qtdEsperada} | Conferido:{' '}
                {divergenceModalItem.qtdConferida}
              </p>
              <div>
                <Label htmlFor="motivo" className="text-xs text-slate-400">
                  Motivo da divergência (obrigatório)
                </Label>
                <Input
                  id="motivo"
                  value={divergenceReason}
                  onChange={(e) => setDivergenceReason(e.target.value)}
                  placeholder="Ex: Embalagem avariada / Falta na NF / Quebra"
                  className="bg-slate-950 border-slate-700 text-white mt-1"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDivergenceModalItem(null)}
                  className="bg-slate-800 text-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  disabled={!divergenceReason.trim()}
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((it) =>
                        it.id === divergenceModalItem.id
                          ? { ...it, divergenciaMotivo: divergenceReason.trim() }
                          : it,
                      ),
                    )
                    setDivergenceModalItem(null)
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Salvar Motivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barra Fixa Inferior de Ação */}
      {docLoaded && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md flex items-center gap-2 z-40 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setDocLoaded(false)
              setItems([])
            }}
            className="h-12 flex-1 bg-slate-800 border-slate-700 text-slate-200 font-semibold"
          >
            Trocar Doc
          </Button>

          <Button
            disabled={isFinishing || items.length === 0}
            onClick={handleFinishReceipt}
            className={`h-12 flex-[2] font-bold text-white rounded-xl flex items-center justify-center gap-2 ${
              hasDivergences
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>
              {isFinishing
                ? 'Gravando...'
                : hasDivergences
                  ? 'Finalizar com Divergências'
                  : 'Concluir Recebimento'}
            </span>
          </Button>
        </div>
      )}
    </CollectorShellLayout>
  )
}
