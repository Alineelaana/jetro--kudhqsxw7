import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Smartphone,
  Play,
  StopCircle,
  BatteryCharging,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CollectorShellLayout } from './collector-shell-layout'
import { useAuth } from '@/hooks/use-auth'
import {
  getOpenShiftForOperator,
  openCollectorShift,
  closeCollectorShift,
  getStoredDevice,
  setStoredDevice,
} from '@/services/collector'
import type { CollectorShift } from '@/types/collector'
import pb from '@/lib/pocketbase/client'

export const CollectorShiftScreen: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeShift, setActiveShift] = useState<CollectorShift | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  // Campos de abertura
  const [dispositivoCodigo, setDispositivoCodigo] = useState('')
  const [filial, setFilial] = useState('')
  const [bateriaInicial, setBateriaInicial] = useState<number>(100)
  const [observacoes, setObservacoes] = useState('')

  // Campos de fechamento
  const [bateriaFinal, setBateriaFinal] = useState<number>(85)
  const [obsFechamento, setObsFechamento] = useState('')

  // Dispositivos cadastrados no sistema
  const [dispositivosList, setDispositivosList] = useState<
    Array<{ id: string; codigo: string; nome?: string }>
  >([])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const stored = getStoredDevice()
      if (stored) {
        setDispositivoCodigo(stored.codigo || '')
        setFilial(stored.filial || '')
      }

      // Buscar coletores cadastrados na coleção wms_collectors (se existir)
      try {
        const devs = await pb.collection('wms_collectors').getList(1, 20, {
          sort: 'code',
        })
        if (devs.items.length > 0) {
          setDispositivosList(
            devs.items.map((d) => ({
              id: d.id,
              codigo: String(d.code || d.name || d.id),
              nome: String(d.name || ''),
            })),
          )
          if (!stored && devs.items[0]) {
            setDispositivoCodigo(String(devs.items[0].code || devs.items[0].name))
          }
        }
      } catch {
        // Fallback para coletores padrão
        setDispositivosList([
          { id: 'dev-01', codigo: 'COL-01', nome: 'Coletor Datalogic Memor 10' },
          { id: 'dev-02', codigo: 'COL-02', nome: 'Coletor Zebra TC21' },
          { id: 'dev-03', codigo: 'COL-03', nome: 'Coletor Honeywell EDA51' },
        ])
        if (!stored) setDispositivoCodigo('COL-01')
      }

      if (user?.id) {
        try {
          const shift = await getOpenShiftForOperator(user.id)
          setActiveShift(shift)
        } catch {
          // ignore
        }
      }

      // Tentar pegar bateria do navegador
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        try {
          const navAny = navigator as unknown as { getBattery: () => Promise<{ level: number }> }
          const battery = await navAny.getBattery()
          const levelPct = Math.round(battery.level * 100)
          setBateriaInicial(levelPct)
          setBateriaFinal(levelPct)
        } catch {
          // ignore
        }
      }

      setLoading(false)
    }
    init()
  }, [user])

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    setErrorMsg('')
    setSuccessMsg('')

    const cod = dispositivoCodigo.trim() || 'COL-01'
    setStoredDevice({ id: cod, codigo: cod, filial: filial.trim() })

    try {
      const shift = await openCollectorShift({
        operador_id: user.id,
        operador_nome: user.name || user.email,
        dispositivo_codigo: cod,
        turno_nome: 'Turno Regular',
        bateria_inicial: Number(bateriaInicial) || 100,
        observacoes,
        empresa_id: user.empresa_id as string | undefined,
        filial_id: (filial.trim() || user.filial_id) as string | undefined,
      })
      setActiveShift(shift)
      setSuccessMsg('Turno aberto com sucesso! Dispositivo pronto para operação.')
      setTimeout(() => navigate('/admin/coletor'), 1200)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  const handleCloseShift = async () => {
    if (!activeShift) return
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await closeCollectorShift(activeShift.id, Number(bateriaFinal), obsFechamento)
      setActiveShift(null)
      setSuccessMsg('Turno fechado com sucesso! Resumo da jornada gravado.')
      setTimeout(() => navigate('/admin/coletor'), 1200)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <CollectorShellLayout
      title="Turno de Trabalho"
      subtitle="Abertura e Fechamento de Jornada no Coletor"
      backRoute="/admin/coletor"
    >
      <div className="space-y-4 max-w-xl mx-auto py-2">
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-red-200 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-200 text-sm flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Situação Atual do Operador */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                Operador: <span className="text-white font-bold">{user?.name || user?.email}</span>
              </CardTitle>
              {activeShift ? (
                <Badge className="bg-emerald-600 text-white font-semibold">Turno Aberto</Badge>
              ) : (
                <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                  Nenhum Turno Ativo
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Formulário de Abertura quando NÃO há turno */}
        {!activeShift && !loading && (
          <form onSubmit={handleOpenShift} className="space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Abrir Novo Turno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dispositivo" className="text-xs uppercase text-slate-400">
                    Dispositivo / Coletor
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="dispositivo"
                      value={dispositivoCodigo}
                      onChange={(e) => setDispositivoCodigo(e.target.value)}
                      placeholder="Ex: COL-01"
                      className="h-12 text-base font-mono bg-slate-950 border-slate-700 text-white"
                      required
                    />
                  </div>
                  {dispositivosList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {dispositivosList.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDispositivoCodigo(d.codigo)}
                          className={`text-xs px-2.5 py-1 rounded border ${
                            dispositivoCodigo === d.codigo
                              ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {d.codigo} {d.nome ? `(${d.nome})` : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="filial"
                      className="text-xs uppercase text-slate-400 flex items-center gap-1"
                    >
                      <Building className="h-3 w-3" /> Filial / CD
                    </Label>
                    <Input
                      id="filial"
                      value={filial}
                      onChange={(e) => setFilial(e.target.value)}
                      placeholder="CD Principal"
                      className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="bateria"
                      className="text-xs uppercase text-slate-400 flex items-center gap-1"
                    >
                      <BatteryCharging className="h-3 w-3 text-emerald-400" /> Bateria (%)
                    </Label>
                    <Input
                      id="bateria"
                      type="number"
                      min="1"
                      max="100"
                      value={bateriaInicial}
                      onChange={(e) => setBateriaInicial(Number(e.target.value))}
                      className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="obs" className="text-xs uppercase text-slate-400">
                    Observações de Início (opcional)
                  </Label>
                  <Input
                    id="obs"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Troca de bateria às 14h, setor Azeitonas"
                    className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Play className="h-5 w-5" />
                  Iniciar Turno de Coletor
                </Button>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Painel de Fechamento quando HÁ turno aberto */}
        {activeShift && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-400 flex items-center gap-2">
                <StopCircle className="h-5 w-5" />
                Encerrar Turno Ativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Turno ID:</span>
                  <span className="font-mono text-emerald-400">{activeShift.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Iniciado em:</span>
                  <span>{new Date(activeShift.data_inicio).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispositivo:</span>
                  <span className="font-semibold text-white">
                    {activeShift.dispositivo_codigo || 'Coletor 01'}
                  </span>
                </div>
                {activeShift.bateria_inicial && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bateria Inicial:</span>
                    <span>{activeShift.bateria_inicial}%</span>
                  </div>
                )}
              </div>

              <div>
                <Label
                  htmlFor="bateriaFim"
                  className="text-xs uppercase text-slate-400 flex items-center gap-1"
                >
                  <BatteryCharging className="h-3 w-3 text-red-400" /> Bateria Final (%)
                </Label>
                <Input
                  id="bateriaFim"
                  type="number"
                  min="0"
                  max="100"
                  value={bateriaFinal}
                  onChange={(e) => setBateriaFinal(Number(e.target.value))}
                  className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="obsFim" className="text-xs uppercase text-slate-400">
                  Observações de Encerramento (opcional)
                </Label>
                <Input
                  id="obsFim"
                  value={obsFechamento}
                  onChange={(e) => setObsFechamento(e.target.value)}
                  placeholder="Ex: Todos os pedidos da wave 04 concluídos"
                  className="h-11 bg-slate-950 border-slate-700 text-white mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/coletor')}
                  className="flex-1 h-12 bg-slate-800 border-slate-700 text-slate-200"
                >
                  Voltar ao Menu
                </Button>
                <Button
                  type="button"
                  onClick={handleCloseShift}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <StopCircle className="h-5 w-5" />
                  Fechar Turno
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </CollectorShellLayout>
  )
}
