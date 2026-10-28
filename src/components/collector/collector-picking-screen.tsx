import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ListOrdered,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface PickingLine {
  id: string
  produtoId: string
  produtoCodigo: string
  produtoNome: string
  barcode: string
  endereco: string
  lote: string
  validade: string
  quantidadePedida: number
  quantidadeSeparada: number
  status: 'pendente' | 'parcial' | 'concluido'
}

interface OrderPickingInfo {
  id: string
  orderNumber: string
  customerName: string
  lines: PickingLine[]
}

export const CollectorPickingScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [availableOrders, setAvailableOrders] = useState<
    Array<{ id: string; order_number: string; customer_name: string; total: number }>
  >([])
  const [selectedOrder, setSelectedOrder] = useState<OrderPickingInfo | null>(null)
  const [activeLineIndex, setActiveLineIndex] = useState<number>(0)
  const [scanInput, setScanInput] = useState<string>('')
  const [qtyInput, setQtyInput] = useState<number>(1)
  const [divergenceReason, setDivergenceReason] = useState<string>('')
  const [showDivergenceDialog, setShowDivergenceDialog] = useState<boolean>(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [isFinishing, setIsFinishing] = useState<boolean>(false)

  // Carrega pedidos confirmados em separação
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const records = await pb.collection('sales_orders').getList(1, 10, {
          sort: '-created',
        })
        if (records.items.length > 0) {
          setAvailableOrders(
            records.items.map((r) => ({
              id: r.id,
              order_number: String(r.order_number || r.id),
              customer_name: String(r.customer_name || 'Cliente HURAM Atacado'),
              total: Number(r.total_amount || 0),
            })),
          )
        } else {
          // Fallback pedidos de teste
          setAvailableOrders([
            {
              id: 'ped-101',
              order_number: 'PED-2025-0101',
              customer_name: 'Supermercado Central',
              total: 1250,
            },
            {
              id: 'ped-102',
              order_number: 'PED-2025-0102',
              customer_name: 'Pizzaria Bella Itália',
              total: 680,
            },
          ])
        }
      } catch {
        setAvailableOrders([
          {
            id: 'ped-101',
            order_number: 'PED-2025-0101',
            customer_name: 'Supermercado Central',
            total: 1250,
          },
        ])
      }
    }
    fetchOrders()
  }, [])

  // Iniciar separação do pedido selecionado (ordena linhas por endereço/corredor para diminuir deslocamento)
  const handleSelectOrder = (order: {
    id: string
    order_number: string
    customer_name: string
  }) => {
    const lines: PickingLine[] = [
      {
        id: 'lin-1',
        produtoId: 'prod-01',
        produtoCodigo: 'AZE-VERDE-BALDE',
        produtoNome: 'Azeitona Verde Inteira Balde 2kg',
        barcode: '78910001',
        endereco: 'A-01-01',
        lote: 'L-2025-A',
        validade: '2026-05-10', // FEFO
        quantidadePedida: 4,
        quantidadeSeparada: 0,
        status: 'pendente',
      },
      {
        id: 'lin-2',
        produtoId: 'prod-02',
        produtoCodigo: 'AZE-PRETA-POTE',
        produtoNome: 'Azeitona Preta Azapa Pote 500g',
        barcode: '78910002',
        endereco: 'A-01-03',
        lote: 'L-2025-B',
        validade: '2026-07-20',
        quantidadePedida: 6,
        quantidadeSeparada: 0,
        status: 'pendente',
      },
      {
        id: 'lin-3',
        produtoId: 'prod-03',
        produtoCodigo: 'AZE-FAT-500',
        produtoNome: 'Azeitona Verde Fatiada 500g',
        barcode: '78910003',
        endereco: 'B-02-01',
        lote: 'L-2025-C',
        validade: '2026-09-15',
        quantidadePedida: 3,
        quantidadeSeparada: 0,
        status: 'pendente',
      },
    ]

    // Ordenar por endereço para roteamento inteligente de picking
    lines.sort((a, b) => a.endereco.localeCompare(b.endereco))

    setSelectedOrder({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      lines,
    })
    setActiveLineIndex(0)
    setQtyInput(1)
    setFeedback({
      type: 'success',
      message: `Pedido ${order.order_number} carregado com roteiro ordenado de picking.`,
    })
    playAudioFeedback('success')
  }

  // Leitura do item ou endereço da linha atual
  const handleScanItemOrAddress = (code: string) => {
    if (!selectedOrder) return
    const currentLine = selectedOrder.lines[activeLineIndex]
    if (!currentLine) return

    const trimmed = code.trim().toLowerCase()
    const matchesItem =
      trimmed === currentLine.barcode.toLowerCase() ||
      trimmed === currentLine.produtoCodigo.toLowerCase()
    const matchesAddr = trimmed === currentLine.endereco.toLowerCase()

    if (matchesItem || matchesAddr) {
      // Confirma 1 ou a quantidade informada
      handleConfirmCurrentLine(qtyInput)
    } else {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: `Código lido "${code}" não confere com o item (${currentLine.produtoCodigo}) ou endereço (${currentLine.endereco}) da tarefa atual.`,
      })
      setScanInput('')
    }
  }

  // Confirmação da separação da linha
  const handleConfirmCurrentLine = (qty: number) => {
    if (!selectedOrder) return
    const currentLine = selectedOrder.lines[activeLineIndex]
    if (!currentLine) return

    const newSeparated = currentLine.quantidadeSeparada + qty
    const updatedLines = [...selectedOrder.lines]

    updatedLines[activeLineIndex] = {
      ...currentLine,
      quantidadeSeparada: newSeparated,
      status:
        newSeparated >= currentLine.quantidadePedida
          ? 'concluido'
          : newSeparated > 0
            ? 'parcial'
            : 'pendente',
    }

    setSelectedOrder({
      ...selectedOrder,
      lines: updatedLines,
    })

    triggerHapticFeedback('success')
    playAudioFeedback('success')
    setFeedback({
      type: 'success',
      message: `Item separado: ${currentLine.produtoNome} (${newSeparated}/${currentLine.quantidadePedida})`,
    })
    setScanInput('')

    // Se completou a linha, avança automaticamente para a próxima pendente
    if (newSeparated >= currentLine.quantidadePedida) {
      const nextPendingIndex = updatedLines.findIndex(
        (l, idx) => idx > activeLineIndex && l.status !== 'concluido',
      )
      if (nextPendingIndex !== -1) {
        setActiveLineIndex(nextPendingIndex)
        setQtyInput(1)
      } else {
        // Checar se há alguma anterior pendente
        const anyPendingIndex = updatedLines.findIndex((l) => l.status !== 'concluido')
        if (anyPendingIndex !== -1) {
          setActiveLineIndex(anyPendingIndex)
        }
      }
    }
  }

  // Finalização do picking do pedido
  const handleFinishPicking = async () => {
    if (!selectedOrder) return
    const shift = getLocalActiveShift()
    if (!shift && user?.role !== 'SUP') {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: 'Turno fechado! Abra o turno antes de finalizar separação.',
      })
      return
    }

    // Verificar se há itens com saldo pendente sem motivo
    const hasIncomplete = selectedOrder.lines.some((l) => l.quantidadeSeparada < l.quantidadePedida)
    if (hasIncomplete && !divergenceReason) {
      setShowDivergenceDialog(true)
      return
    }

    setIsFinishing(true)

    // Grava cada linha como operação idempotente
    for (const l of selectedOrder.lines) {
      const div = l.quantidadeSeparada - l.quantidadePedida
      await executeCollectorOperation({
        tipo: 'separacao',
        shift_id: shift?.id,
        dispositivo_codigo: shift?.dispositivo_codigo || 'COL-01',
        operador_id: user?.id || 'op',
        operador_nome: user?.name || user?.email,
        documento_referencia: selectedOrder.orderNumber,
        produto_id: l.produtoId,
        produto_codigo: l.produtoCodigo,
        produto_nome: l.produtoNome,
        codigo_barras_lido: l.barcode,
        lote: l.lote,
        validade: l.validade,
        endereco_origem: l.endereco,
        endereco_destino: 'AREA-EXPEDICAO',
        quantidade_esperada: l.quantidadePedida,
        quantidade_executada: l.quantidadeSeparada,
        divergencia: div,
        motivo_divergencia:
          div !== 0 ? divergenceReason || 'Corte parcial de separação' : undefined,
        status: div !== 0 ? 'divergente' : 'concluido',
        idempotency_key: `sep_${selectedOrder.id}_${l.id}_${Date.now()}`,
        metadata: {
          cliente: selectedOrder.customerName,
          orderId: selectedOrder.id,
        },
        empresa_id: user?.empresa_id,
        filial_id: user?.filial_id,
      })
    }

    // Se houver integração com status do pedido, atualiza para separado/conferência
    try {
      await pb.collection('sales_orders').update(selectedOrder.id, {
        order_stage: 'expedicao',
        notes: `Separado via Coletor PWA por ${user?.name || 'Operador'} em ${new Date().toLocaleString('pt-BR')}`,
      })
    } catch {
      // Ignora caso permissão ou campo restrito
    }

    setIsFinishing(false)
    playAudioFeedback('success')
    triggerHapticFeedback('success')
    setFeedback({
      type: 'success',
      message: `Separação do pedido ${selectedOrder.orderNumber} concluída com sucesso!`,
    })

    setTimeout(() => {
      setSelectedOrder(null)
      setShowDivergenceDialog(false)
    }, 1500)
  }

  const currentLine = selectedOrder ? selectedOrder.lines[activeLineIndex] : null
  const allLinesDone =
    selectedOrder?.lines.every((l) => l.quantidadeSeparada >= l.quantidadePedida) ?? false

  return (
    <CollectorShellLayout
      title="Separação Dirigida"
      subtitle="Picking Guiado por Endereço e FEFO"
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
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 1. Selecionar Pedido em Carteira */}
        {!selectedOrder ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <ListOrdered className="h-5 w-5" />
                <span>Selecione o Pedido para Iniciar a Separação</span>
              </div>
              <div className="space-y-2">
                {availableOrders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => handleSelectOrder(ord)}
                    className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-blue-500/60 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{ord.order_number}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ord.customer_name}</div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <Badge className="bg-blue-600/30 text-blue-300 border-blue-500/40 text-xs">
                        Aguardando Picking
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cabeçalho do Pedido e Progresso */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-300">
              <div>
                <span className="font-bold text-white text-sm">{selectedOrder.orderNumber}</span> -{' '}
                {selectedOrder.customerName}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="h-6 text-xs text-slate-400 hover:text-white px-2"
              >
                Trocar Pedido
              </Button>
            </div>

            {/* Destaque da Linha Ativa a Separar (Grandona para Coletor) */}
            {currentLine && (
              <Card className="bg-slate-900 border-2 border-blue-500/80 shadow-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-600 text-white font-bold text-xs uppercase px-2 py-0.5">
                      Tarefa #{activeLineIndex + 1} de {selectedOrder.lines.length}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>FEFO: {currentLine.validade}</span>
                    </div>
                  </div>

                  {/* Endereço em Destaque Gigante */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-400" /> Vá até o endereço:
                      </div>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-blue-400 tracking-wider">
                        {currentLine.endereco}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">
                        Lote Recomendado:
                      </div>
                      <div className="text-base font-mono font-bold text-slate-200">
                        {currentLine.lote}
                      </div>
                    </div>
                  </div>

                  {/* Informação do Produto */}
                  <div>
                    <h3 className="text-lg font-bold text-white">{currentLine.produtoNome}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span>
                        Cód: <strong className="text-slate-200">{currentLine.produtoCodigo}</strong>
                      </span>
                      <span>
                        EAN: <strong className="text-slate-200">{currentLine.barcode}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Placar de Quantidade */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">Progresso deste item:</div>
                      <div className="text-xl font-mono font-black">
                        <span className="text-emerald-400">{currentLine.quantidadeSeparada}</span> /{' '}
                        {currentLine.quantidadePedida} un
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={currentLine.quantidadePedida - currentLine.quantidadeSeparada || 1}
                        value={qtyInput}
                        onChange={(e) => setQtyInput(Number(e.target.value))}
                        className="w-16 h-10 text-center font-mono font-bold bg-slate-950 border-slate-700 text-white"
                      />
                      <Button
                        onClick={() => handleConfirmCurrentLine(qtyInput)}
                        className="h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 rounded-lg"
                      >
                        Confirmar +{qtyInput}
                      </Button>
                    </div>
                  </div>

                  {/* Campo de Scanner Automático */}
                  <CollectorScannerField
                    label="Ler Código de Barras ou Endereço para Confirmar"
                    placeholder="Escaneie o EAN ou a etiqueta da posição..."
                    value={scanInput}
                    onChange={setScanInput}
                    onScan={handleScanItemOrAddress}
                    autoFocus
                  />
                </CardContent>
              </Card>
            )}

            {/* Lista com o Roteiro Geral das Linhas do Pedido */}
            <div className="space-y-1.5 pt-2">
              <div className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1 px-1">
                <Layers className="h-3.5 w-3.5" /> Roteiro Geral de Coleta
              </div>

              {selectedOrder.lines.map((l, idx) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setActiveLineIndex(idx)
                    setQtyInput(1)
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    idx === activeLineIndex
                      ? 'bg-blue-950/40 border-blue-500 text-white'
                      : l.status === 'concluido'
                        ? 'bg-emerald-950/20 border-emerald-700/40 text-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-slate-800 text-blue-300">
                      {l.endereco}
                    </span>
                    <span className="truncate text-xs font-medium text-slate-200">
                      {l.produtoNome}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-xs font-mono font-bold">
                    <span>
                      {l.quantidadeSeparada} / {l.quantidadePedida}
                    </span>
                    {l.status === 'concluido' && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Divergência / Corte Parcial */}
      {showDivergenceDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-amber-600 max-w-md w-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="h-5 w-5" />
                <span>Corte de Separação / Itens Pendentes</span>
              </div>
              <p className="text-xs text-slate-300">
                Nem todas as quantidades foram separadas integralmente. Informe o motivo do corte
                para registrar na auditoria WMS:
              </p>
              <Input
                value={divergenceReason}
                onChange={(e) => setDivergenceReason(e.target.value)}
                placeholder="Ex: Falta de estoque físico no endereço / Lote bloqueado"
                className="bg-slate-950 border-slate-700 text-white"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDivergenceDialog(false)}
                  className="bg-slate-800 text-slate-200"
                >
                  Continuar Separando
                </Button>
                <Button
                  size="sm"
                  disabled={!divergenceReason.trim()}
                  onClick={() => {
                    setShowDivergenceDialog(false)
                    handleFinishPicking()
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Confirmar Corte e Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rodapé Fixo de Ação */}
      {selectedOrder && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md flex items-center gap-2 z-40 max-w-4xl mx-auto">
          <Button
            disabled={isFinishing}
            onClick={handleFinishPicking}
            className={`w-full h-12 font-bold text-white rounded-xl flex items-center justify-center gap-2 ${
              allLinesDone
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>
              {isFinishing
                ? 'Gravando Operação...'
                : allLinesDone
                  ? 'Concluir Separação do Pedido'
                  : 'Finalizar com Corte Parcial'}
            </span>
          </Button>
        </div>
      )}
    </CollectorShellLayout>
  )
}
