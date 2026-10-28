import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, CheckCircle2, AlertTriangle, Package, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

interface ShippingVolume {
  id: string
  codigoVolume: string
  pedidoNumero: string
  cliente: string
  tipoEmbalagem: string
  pesoKg: number
  conferido: boolean
}

export const CollectorShippingCheckScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [romaneioRef, setRomaneioRef] = useState('')
  const [romaneioCarregado, setRomaneioCarregado] = useState(false)
  const [scanVolume, setScanVolume] = useState('')
  const [volumes, setVolumes] = useState<ShippingVolume[]>([])
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
  } | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)

  // Carrega lista de volumes do Romaneio de Carga
  const handleLoadRomaneio = (ref: string) => {
    const term = ref.trim() || 'ROM-EXP-084'
    setRomaneioRef(term)

    // Volumes vinculados ao romaneio de expedição
    const mockVolumes: ShippingVolume[] = [
      {
        id: 'vol-1',
        codigoVolume: 'VOL-084-01',
        pedidoNumero: 'PED-2025-0101',
        cliente: 'Supermercado Central',
        tipoEmbalagem: 'Caixa Master Azeitonas',
        pesoKg: 18.5,
        conferido: false,
      },
      {
        id: 'vol-2',
        codigoVolume: 'VOL-084-02',
        pedidoNumero: 'PED-2025-0101',
        cliente: 'Supermercado Central',
        tipoEmbalagem: 'Caixa Master Azeitonas',
        pesoKg: 18.5,
        conferido: false,
      },
      {
        id: 'vol-3',
        codigoVolume: 'VOL-084-03',
        pedidoNumero: 'PED-2025-0102',
        cliente: 'Pizzaria Bella Itália',
        tipoEmbalagem: 'Fardo Potes Azapa',
        pesoKg: 12.0,
        conferido: false,
      },
    ]

    setVolumes(mockVolumes)
    setRomaneioCarregado(true)
    playAudioFeedback('success')
    setFeedback({
      type: 'success',
      message: `Romaneio de expedição ${term} carregado com ${mockVolumes.length} volumes.`,
    })
  }

  // Leitura da etiqueta de volume ou pedido
  const handleScanVolume = (code: string) => {
    const trimmed = code.trim().toUpperCase()
    const index = volumes.findIndex(
      (v) => v.codigoVolume.toUpperCase() === trimmed || v.pedidoNumero.toUpperCase() === trimmed,
    )

    if (index === -1) {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: `Volume "${code}" não pertence a este Romaneio de Expedição!`,
      })
      setScanVolume('')
      return
    }

    const updated = [...volumes]
    const vol = updated[index]

    if (vol.conferido) {
      triggerHapticFeedback('warning')
      playAudioFeedback('warning')
      setFeedback({
        type: 'warning',
        message: `Volume ${vol.codigoVolume} já havia sido conferido.`,
      })
    } else {
      vol.conferido = true
      triggerHapticFeedback('success')
      playAudioFeedback('success')
      setFeedback({
        type: 'success',
        message: `Volume ${vol.codigoVolume} conferido para carregamento (${vol.cliente})`,
      })
    }

    setVolumes(updated)
    setScanVolume('')
  }

  // Finalização da conferência e liberação para romaneio/embarque
  const handleFinishDispatch = async () => {
    const shift = getLocalActiveShift()
    if (!shift && user?.role !== 'SUP') {
      triggerHapticFeedback('error')
      playAudioFeedback('error')
      setFeedback({
        type: 'error',
        message: 'Turno fechado! Abra o turno antes de finalizar conferência.',
      })
      return
    }

    setIsFinishing(true)

    for (const v of volumes) {
      await executeCollectorOperation({
        tipo: 'conferencia_expedicao',
        shift_id: shift?.id,
        dispositivo_codigo: shift?.dispositivo_codigo || 'COL-01',
        operador_id: user?.id || 'op',
        operador_nome: user?.name || user?.email,
        documento_referencia: romaneioRef,
        produto_codigo: v.codigoVolume,
        produto_nome: `${v.tipoEmbalagem} (${v.cliente})`,
        codigo_barras_lido: v.codigoVolume,
        endereco_origem: 'AREA-EXPEDICAO',
        endereco_destino: 'DOCA-CARREGAMENTO',
        quantidade_esperada: 1,
        quantidade_executada: v.conferido ? 1 : 0,
        divergencia: v.conferido ? 0 : -1,
        motivo_divergencia: !v.conferido ? 'Volume não embarcado no caminhão' : undefined,
        status: v.conferido ? 'concluido' : 'divergente',
        idempotency_key: `exp_${romaneioRef}_${v.id}_${Date.now()}`,
        metadata: {
          pedido: v.pedidoNumero,
          cliente: v.cliente,
          pesoKg: v.pesoKg,
        },
        empresa_id: user?.empresa_id as string | undefined,
        filial_id: user?.filial_id as string | undefined,
      })
    }

    setIsFinishing(false)
    playAudioFeedback('success')
    triggerHapticFeedback('success')
    setFeedback({
      type: 'success',
      message: 'Conferência de expedição finalizada com sucesso! Carga liberada.',
    })

    setTimeout(() => navigate('/admin/coletor'), 1500)
  }

  const conferidosCount = volumes.filter((v) => v.conferido).length
  const totalCount = volumes.length
  const allConferred = totalCount > 0 && conferidosCount === totalCount

  return (
    <CollectorShellLayout
      title="Conferência de Expedição"
      subtitle="Validação de Volumes e Carregamento de Cargas"
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

        {/* 1. Passo: Identificar Romaneio de Carga */}
        {!romaneioCarregado ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-4">
              <CollectorScannerField
                label="Romaneio de Carga / Ordem de Carregamento"
                placeholder="Escaneie o código do Romaneio (ex: ROM-EXP-084)..."
                value={romaneioRef}
                onChange={setRomaneioRef}
                onScan={handleLoadRomaneio}
              />
              <Button
                onClick={() => handleLoadRomaneio(romaneioRef || 'ROM-EXP-084')}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
              >
                <Truck className="h-4 w-4 mr-2" />
                Carregar Volumes da Carga
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Leitor Contínuo de Volume */}
            <Card className="bg-slate-900 border-indigo-600/60">
              <CardContent className="p-3">
                <CollectorScannerField
                  label="Escanear Etiqueta de Volume (VOL-XX)"
                  placeholder="Aponte o leitor para o código de barras da caixa..."
                  value={scanVolume}
                  onChange={setScanVolume}
                  onScan={handleScanVolume}
                  autoFocus
                />
              </CardContent>
            </Card>

            {/* Placar de Progresso */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Romaneio: <strong className="text-white">{romaneioRef}</strong>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Conferidos: {conferidosCount} de {totalCount} volumes
                </div>
              </div>

              <div className="text-2xl font-mono font-black">
                <span className={allConferred ? 'text-emerald-400' : 'text-indigo-400'}>
                  {conferidosCount}
                </span>
                <span className="text-slate-500"> / {totalCount}</span>
              </div>
            </div>

            {/* Lista dos Volumes */}
            <div className="space-y-2">
              {volumes.map((v) => (
                <Card
                  key={v.id}
                  className={`border transition-all ${
                    v.conferido
                      ? 'bg-emerald-950/20 border-emerald-600/40'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {v.codigoVolume}
                        </span>
                        {v.conferido ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] py-0">
                            Embarcado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-slate-400 border-slate-700 text-[10px] py-0"
                          >
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        {v.pedidoNumero} - {v.cliente}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {v.tipoEmbalagem} ({v.pesoKg} kg)
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScanVolume(v.codigoVolume)}
                      className={`h-9 px-3 font-semibold text-xs rounded-lg ${
                        v.conferido
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {v.conferido ? 'Conferido' : 'Bipar Manual'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Barra Fixa Inferior */}
      {romaneioCarregado && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md flex items-center gap-2 z-40 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setRomaneioCarregado(false)
              setVolumes([])
            }}
            className="h-12 flex-1 bg-slate-800 border-slate-700 text-slate-200"
          >
            Trocar Romaneio
          </Button>

          <Button
            disabled={isFinishing || volumes.length === 0}
            onClick={handleFinishDispatch}
            className={`h-12 flex-[2] font-bold text-white rounded-xl flex items-center justify-center gap-2 ${
              allConferred
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>
              {isFinishing
                ? 'Gravando...'
                : allConferred
                  ? 'Liberar Romaneio e Carga'
                  : 'Liberar Parcial'}
            </span>
          </Button>
        </div>
      )}
    </CollectorShellLayout>
  )
}
