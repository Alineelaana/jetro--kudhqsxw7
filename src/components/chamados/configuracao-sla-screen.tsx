import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  chamadosService,
  PRIORIDADE_LABELS,
  type ChamadoPrioridade,
  type ChamadoSlaConfig,
} from '@/services/chamados'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from 'lucide-react'

interface DepartamentoOption {
  id: string
  name: string
  code?: string
}

export default function ConfiguracaoSlaScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [regras, setRegras] = useState<ChamadoSlaConfig[]>([])
  const [setores, setSetores] = useState<DepartamentoOption[]>([])

  // Modal de edição / criação
  const [modalAberto, setModalAberto] = useState(false)
  const [regraEmEdicao, setRegraEmEdicao] = useState<Partial<ChamadoSlaConfig> | null>(null)

  const isMasterOrAdmin =
    user?.role === 'SUP' ||
    (typeof user?.perfil_acesso === 'string' &&
      (user.perfil_acesso.toLowerCase().includes('admin') ||
        user.perfil_acesso.toLowerCase().includes('master')))

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [slaLista, setoresLista] = await Promise.all([
        chamadosService.listarSlaConfigs(),
        chamadosService.getSetores().catch(() => []),
      ])
      setRegras(slaLista)
      setSetores(setoresLista as DepartamentoOption[])
    } catch (err: any) {
      toast.error('Erro ao carregar regras de SLA: ' + (err.message || 'Falha de conexão.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const abrirModalNovaRegra = () => {
    setRegraEmEdicao({
      prioridade: 'normal',
      setor: '',
      tempo_primeira_resposta_horas: 12,
      tempo_resolucao_horas: 48,
      ativo: true,
      descricao: '',
    })
    setModalAberto(true)
  }

  const abrirModalEditarRegra = (regra: ChamadoSlaConfig) => {
    setRegraEmEdicao({ ...regra })
    setModalAberto(true)
  }

  const salvarRegra = async () => {
    if (!regraEmEdicao) return

    if (!regraEmEdicao.prioridade) {
      toast.error('Selecione a prioridade do chamado.')
      return
    }

    const hResp = Number(regraEmEdicao.tempo_primeira_resposta_horas)
    const hRes = Number(regraEmEdicao.tempo_resolucao_horas)

    if (isNaN(hResp) || hResp <= 0) {
      toast.error('Informe um tempo de primeira resposta válido (maior que zero horas).')
      return
    }

    if (isNaN(hRes) || hRes <= 0) {
      toast.error('Informe um tempo de resolução válido (maior que zero horas).')
      return
    }

    if (hResp > hRes) {
      toast.error('O tempo de primeira resposta não pode ser maior que o tempo total de resolução.')
      return
    }

    setSalvando(true)
    try {
      const payload: Partial<ChamadoSlaConfig> = {
        prioridade: regraEmEdicao.prioridade as ChamadoPrioridade,
        setor: regraEmEdicao.setor || undefined,
        tempo_primeira_resposta_horas: hResp,
        tempo_resolucao_horas: hRes,
        ativo: regraEmEdicao.ativo !== false,
        descricao: regraEmEdicao.descricao || '',
      }

      if (regraEmEdicao.id) {
        await chamadosService.atualizarSlaConfig(regraEmEdicao.id, payload)
        toast.success('Regra de SLA atualizada com sucesso.')
      } else {
        await chamadosService.criarSlaConfig(payload)
        toast.success('Nova regra de SLA cadastrada com sucesso.')
      }

      setModalAberto(false)
      setRegraEmEdicao(null)
      await carregarDados()
    } catch (err: any) {
      toast.error('Erro ao salvar regra de SLA: ' + (err.message || 'Falha no banco.'))
    } finally {
      setSalvando(false)
    }
  }

  const excluirRegra = async (id: string) => {
    if (!confirm('Deseja realmente remover esta regra de SLA?')) return
    try {
      await chamadosService.excluirSlaConfig(id)
      toast.success('Regra excluída com sucesso.')
      await carregarDados()
    } catch (err: any) {
      toast.error('Erro ao excluir regra: ' + (err.message || 'Operação negada.'))
    }
  }

  const toggleAtivo = async (regra: ChamadoSlaConfig) => {
    if (!isMasterOrAdmin) {
      toast.error('Apenas administradores podem ativar/desativar regras de SLA.')
      return
    }
    try {
      await chamadosService.atualizarSlaConfig(regra.id, { ativo: !regra.ativo })
      toast.success(`Regra ${!regra.ativo ? 'ativada' : 'desativada'} com sucesso.`)
      setRegras((prev) => prev.map((r) => (r.id === regra.id ? { ...r, ativo: !regra.ativo } : r)))
    } catch (err: any) {
      toast.error('Erro ao alterar status da regra: ' + err.message)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho Corporativo Jetro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#002817] text-[#C9A227] rounded-lg shadow-sm border border-[#C9A227]/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Configuração de SLA
                <Badge
                  variant="outline"
                  className="bg-[#002817]/5 text-[#002817] border-[#002817]/20 dark:text-[#C9A227] dark:border-[#C9A227]/30"
                >
                  Administração Jetro
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Defina os prazos operacionais reais de atendimento e resolução por prioridade e por
                setor.
              </p>
            </div>
          </div>
        </div>

        {isMasterOrAdmin && (
          <Button
            onClick={abrirModalNovaRegra}
            className="bg-[#002817] hover:bg-[#003820] text-[#E4C46A] border border-[#C9A227]/40 shadow-sm gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Regra de SLA
          </Button>
        )}
      </div>

      {/* Cartões informativos sobre a mecânica de SLA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-600 shadow-sm bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-sm">Dentro do Prazo</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chamados cuja data atual está dentro do limite estipulado pela prioridade e setor.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm">Próximo do Vencimento</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chamados em aberto com menos de 25% do tempo restante ou menos de 8 horas para
              expirar.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600 shadow-sm bg-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-rose-600" />
              <span className="font-semibold text-sm">Fora do Prazo / Atrasado</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Extrapolou a data limite de resolução ou foi finalizado após o encerramento do prazo.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Regras Ativas */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <span>Matriz de Prazos Operacionais</span>
            <span className="text-xs font-normal text-muted-foreground">
              {regras.length} regra(s) configurada(s)
            </span>
          </CardTitle>
          <CardDescription>
            Quando um chamado é aberto, o sistema localiza a regra específica do setor selecionado.
            Caso não exista regra setorizada, é aplicada a regra geral da prioridade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#002817]" />
              <span>Carregando matriz de SLA...</span>
            </div>
          ) : regras.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg p-6">
              <Clock className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-base">Nenhuma regra de SLA configurada</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Cadastre as regras de atendimento e resolução para que os indicadores do Painel
                Gerencial reflitam prazos reais.
              </p>
              {isMasterOrAdmin && (
                <Button
                  onClick={abrirModalNovaRegra}
                  className="mt-4 bg-[#002817] text-[#E4C46A] gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Primeira Regra
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[140px]">Prioridade</TableHead>
                    <TableHead className="w-[200px]">Setor Específico</TableHead>
                    <TableHead className="text-center w-[160px]">1ª Resposta</TableHead>
                    <TableHead className="text-center w-[160px]">Resolução Total</TableHead>
                    <TableHead>Descrição / Observações</TableHead>
                    <TableHead className="text-center w-[100px]">Status</TableHead>
                    {isMasterOrAdmin && (
                      <TableHead className="text-right w-[120px]">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regras.map((regra) => {
                    const prioridadeInfo = PRIORIDADE_LABELS[regra.prioridade]
                    const setorNome =
                      regra.expand?.setor?.name ||
                      (regra.setor ? 'Setor cadastrado' : 'Geral (Todos os Setores)')
                    const isGeral = !regra.setor

                    return (
                      <TableRow
                        key={regra.id}
                        className={!regra.ativo ? 'opacity-60 bg-muted/20' : ''}
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${prioridadeInfo?.badgeClass || 'bg-slate-100'} text-xs font-semibold uppercase`}
                          >
                            {prioridadeInfo?.label || regra.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-medium text-sm">
                            <Building2
                              className={`w-3.5 h-3.5 ${isGeral ? 'text-muted-foreground' : 'text-[#005B2E]'}`}
                            />
                            <span
                              className={
                                isGeral ? 'text-muted-foreground italic' : 'text-foreground'
                              }
                            >
                              {setorNome}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-foreground">
                            {regra.tempo_primeira_resposta_horas}h
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            (
                            {(regra.tempo_primeira_resposta_horas / 24)
                              .toFixed(1)
                              .replace('.0', '')}
                            d)
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-[#005B2E] dark:text-[#E4C46A]">
                            {regra.tempo_resolucao_horas}h
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({(regra.tempo_resolucao_horas / 24).toFixed(1).replace('.0', '')}d)
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {regra.descricao || '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            type="button"
                            disabled={!isMasterOrAdmin}
                            onClick={() => toggleAtivo(regra)}
                            className="inline-flex focus:outline-none"
                            title={isMasterOrAdmin ? 'Clique para alternar status' : undefined}
                          >
                            {regra.ativo ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Inativo
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        {isMasterOrAdmin && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => abrirModalEditarRegra(regra)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Editar regra"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => excluirRegra(regra.id)}
                                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Excluir regra"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação / Edição de Regra */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-[#002817]" />
              {regraEmEdicao?.id ? 'Editar Regra de SLA' : 'Nova Regra de SLA'}
            </DialogTitle>
            <DialogDescription>
              Configure os tempos de resposta inicial e resolução final para prioridade e setor.
            </DialogDescription>
          </DialogHeader>

          {regraEmEdicao && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Prioridade *</Label>
                  <Select
                    value={regraEmEdicao.prioridade}
                    onValueChange={(val: ChamadoPrioridade) =>
                      setRegraEmEdicao({ ...regraEmEdicao, prioridade: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Setor Aplicável</Label>
                  <Select
                    value={regraEmEdicao.setor || 'todos'}
                    onValueChange={(val) =>
                      setRegraEmEdicao({ ...regraEmEdicao, setor: val === 'todos' ? '' : val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os Setores (Geral)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Setores (Geral)</SelectItem>
                      {setores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">1ª Resposta (horas) *</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={regraEmEdicao.tempo_primeira_resposta_horas ?? 12}
                    onChange={(e) =>
                      setRegraEmEdicao({
                        ...regraEmEdicao,
                        tempo_primeira_resposta_horas: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Prazo para o primeiro contato ou triagem.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Resolução (horas) *</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={regraEmEdicao.tempo_resolucao_horas ?? 48}
                    onChange={(e) =>
                      setRegraEmEdicao({
                        ...regraEmEdicao,
                        tempo_resolucao_horas: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Prazo final para conclusão do chamado.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Descrição / Justificativa</Label>
                <Textarea
                  placeholder="Ex: Padrão operacional para chamados de infraestrutura crítica..."
                  rows={2}
                  value={regraEmEdicao.descricao || ''}
                  onChange={(e) =>
                    setRegraEmEdicao({ ...regraEmEdicao, descricao: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="text-xs font-semibold block">Regra Ativa</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Regras ativas são calculadas imediatamente nos novos chamados.
                  </p>
                </div>
                <Switch
                  checked={regraEmEdicao.ativo !== false}
                  onCheckedChange={(checked) =>
                    setRegraEmEdicao({ ...regraEmEdicao, ativo: checked })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={salvarRegra}
              disabled={salvando}
              className="bg-[#002817] hover:bg-[#003820] text-[#E4C46A]"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Regra'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
