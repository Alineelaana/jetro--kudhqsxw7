import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Play,
  CheckCircle2,
  Package,
  Gift,
  ShoppingCart,
  FileCheck,
  Sliders,
  Users,
  Loader2,
  Info,
} from 'lucide-react'
import {
  getAuditAlertRules,
  saveAuditAlertRule,
  deleteAuditAlertRule,
  toggleAuditAlertRuleActive,
  getSystemUsersList,
  evaluateAlertRulesBackend,
  type AuditAlertRule,
  type AlertCategory,
  type ThresholdType,
  type SystemUserOption,
} from '@/services/audit-rules'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

const CATEGORY_MAP: Record<AlertCategory, { label: string; icon: typeof Package; color: string }> =
  {
    estoque_wms: { label: 'Estoque, Inventário e WMS', icon: Package, color: 'text-amber-600' },
    bonificacao: { label: 'Pedidos de Bonificação', icon: Gift, color: 'text-purple-600' },
    vendas: { label: 'Pedidos de Venda', icon: ShoppingCart, color: 'text-blue-600' },
    verbas: { label: 'Verbas Comerciais', icon: FileCheck, color: 'text-emerald-600' },
    personalizado: { label: 'Alertas Personalizados', icon: Sliders, color: 'text-[#005B2E]' },
  }

export function AuditMovementAlertsSection() {
  const { user } = useAuth()
  const [rules, setRules] = useState<AuditAlertRule[]>([])
  const [users, setUsers] = useState<SystemUserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingRule, setEditingRule] = useState<Partial<AuditAlertRule> | null>(null)
  const [savingRule, setSavingRule] = useState(false)

  const userIdentifier = user?.name || user?.login || user?.email || 'admin'
  const userEmpresa = user?.empresa || ''

  const loadData = async () => {
    setLoading(true)
    try {
      const [rList, uList] = await Promise.all([
        getAuditAlertRules(userEmpresa),
        getSystemUsersList(),
      ])
      setRules(rList)
      setUsers(uList)
    } catch {
      toast({
        title: 'Erro ao carregar configurações de alertas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggle = async (rule: AuditAlertRule) => {
    const nextState = !rule.active
    try {
      await toggleAuditAlertRuleActive(rule.id, nextState, rule.name, userIdentifier, userEmpresa)
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active: nextState } : r)))
      toast({
        title: nextState ? 'Alerta ativado' : 'Alerta desativado',
        description: `Regra "${rule.name}" ${nextState ? 'agora está ativa' : 'foi pausada'}.`,
      })
    } catch {
      toast({ title: 'Erro ao alterar status do alerta', variant: 'destructive' })
    }
  }

  const handleOpenCreate = () => {
    setEditingRule({
      name: '',
      category: 'personalizado',
      code: `custom_${Date.now()}`,
      description: '',
      is_custom: true,
      active: true,
      severity: 'warning',
      threshold_type: 'quantidade',
      threshold_value: 10,
      recipient_user_ids: [],
      custom_condition: '',
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (rule: AuditAlertRule) => {
    setEditingRule({ ...rule })
    setDialogOpen(true)
  }

  const handleSaveRule = async () => {
    if (!editingRule || !editingRule.name) {
      toast({ title: 'Informe o nome do alerta', variant: 'destructive' })
      return
    }

    setSavingRule(true)
    try {
      await saveAuditAlertRule(editingRule, userIdentifier, userEmpresa)
      toast({
        title: 'Alerta salvo com sucesso!',
        description: 'As alterações foram registradas na Auditoria do Sistema.',
      })
      setDialogOpen(false)
      setEditingRule(null)
      await loadData()
    } catch {
      toast({ title: 'Erro ao salvar alerta', variant: 'destructive' })
    } finally {
      setSavingRule(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    const target = rules.find((r) => r.id === deleteId)
    try {
      await deleteAuditAlertRule(deleteId, target?.name || 'Alerta', userIdentifier, userEmpresa)
      toast({
        title: 'Alerta excluído com sucesso',
        description: 'Operação registrada na Auditoria do Sistema.',
      })
      setDeleteId(null)
      await loadData()
    } catch {
      toast({ title: 'Erro ao excluir alerta', variant: 'destructive' })
    }
  }

  const handleRunEvaluation = async () => {
    setEvaluating(true)
    try {
      const res = await evaluateAlertRulesBackend(userEmpresa)
      if (res.success) {
        toast({
          title: 'Verificação de alertas executada',
          description: `${res.evaluated_rules} regras avaliadas. ${res.occurrences_generated} novas ocorrências registradas na auditoria.`,
        })
      } else {
        toast({ title: 'Verificação concluída com avisos', variant: 'default' })
      }
    } catch {
      toast({ title: 'Falha ao executar verificação imediata', variant: 'destructive' })
    } finally {
      setEvaluating(false)
    }
  }

  const getThresholdLabel = (type?: ThresholdType) => {
    switch (type) {
      case 'valor_moeda':
        return 'Valor Limite (R$)'
      case 'percentual':
        return 'Percentual Limite (%)'
      case 'quantidade':
        return 'Quantidade Limite (un)'
      case 'dias':
        return 'Prazo Limite (dias)'
      default:
        return 'Limite de Referência'
    }
  }

  const getRecipientNames = (ids: string[]) => {
    if (!ids || ids.length === 0) return 'Nenhum usuário configurado'
    const names = ids.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean)
    return names.length > 0 ? names.join(', ') : `${ids.length} usuário(s) selecionado(s)`
  }

  // Agrupa regras por categoria
  const categories: AlertCategory[] = [
    'estoque_wms',
    'bonificacao',
    'vendas',
    'verbas',
    'personalizado',
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/40 p-4 rounded-lg border border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Configuração de Alertas para Movimentações Suspeitas e Limites
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure limites operacionais, prazos e movimentações anômalas. Todas as ocorrências e
            alterações de configuração são registradas na auditoria.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="border-[#005B2E] text-[#005B2E] font-medium"
          >
            {evaluating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Verificar Agora
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Criar Alerta
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((catKey) => {
          const catMeta = CATEGORY_MAP[catKey]
          const catRules = rules.filter((r) => r.category === catKey)
          const IconComp = catMeta.icon

          return (
            <Card key={catKey} className="border-2 border-border/80 shadow-sm">
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <IconComp className={`w-4 h-4 ${catMeta.color}`} />
                  {catMeta.label}
                  <Badge variant="outline" className="text-xs ml-2 font-normal">
                    {catRules.length} alerta(s)
                  </Badge>
                </CardTitle>
                {catKey === 'personalizado' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleOpenCreate}
                    className="h-7 text-xs text-[#005B2E] hover:text-[#01361D] font-bold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/60">
                {catRules.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground italic">
                    Nenhum alerta configurado nesta categoria.
                  </div>
                ) : (
                  catRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{rule.name}</span>
                          <Badge
                            variant={
                              rule.severity === 'critical'
                                ? 'destructive'
                                : rule.severity === 'warning'
                                  ? 'outline'
                                  : 'secondary'
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {rule.severity === 'critical'
                              ? 'Crítico'
                              : rule.severity === 'warning'
                                ? 'Atenção'
                                : 'Info'}
                          </Badge>
                          {rule.is_custom && (
                            <Badge className="bg-[#005B2E]/10 text-[#005B2E] border-[#005B2E]/30 text-[10px]">
                              Personalizado
                            </Badge>
                          )}
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              rule.active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {rule.active ? 'Ativo' : 'Desativado'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {rule.description || 'Sem descrição cadastrada.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                          {rule.threshold_type !== 'evento' && (
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <span>Parâmetro limite:</span>
                              <strong className="text-[#005B2E]">
                                {rule.threshold_type === 'valor_moeda' &&
                                  `R$ ${Number(rule.threshold_value || 0).toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                  })}`}
                                {rule.threshold_type === 'percentual' && `${rule.threshold_value}%`}
                                {rule.threshold_type === 'quantidade' &&
                                  `${rule.threshold_value} un`}
                                {rule.threshold_type === 'dias' && `${rule.threshold_value} dias`}
                              </strong>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="truncate max-w-[320px]">
                              Notificar:{' '}
                              <strong>{getRecipientNames(rule.recipient_user_ids)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <div className="flex items-center gap-2 mr-2">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={() => handleToggle(rule)}
                            aria-label={`Ativar ou desativar ${rule.name}`}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(rule)}
                          className="h-8 border-[#005B2E] text-[#005B2E]"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Editar
                        </Button>
                        {rule.is_custom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(rule.id)}
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de Criação / Edição de Alerta */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Sliders className="w-5 h-5 text-[#005B2E]" />
              {editingRule?.id ? 'Editar Alerta' : 'Criar Alerta Personalizado'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Defina os parâmetros, condições de disparo e os usuários responsáveis que receberão
              notificações imediatas.
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold">Nome do Alerta *</Label>
                  <Input
                    value={editingRule.name || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    placeholder="Ex: Divergência de Inventário acima de X itens"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Categoria *</Label>
                  <Select
                    value={editingRule.category || 'personalizado'}
                    onValueChange={(val: AlertCategory) =>
                      setEditingRule({ ...editingRule, category: val })
                    }
                    disabled={!editingRule.is_custom}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estoque_wms">Estoque, Inventário e WMS</SelectItem>
                      <SelectItem value="bonificacao">Pedidos de Bonificação</SelectItem>
                      <SelectItem value="vendas">Pedidos de Venda</SelectItem>
                      <SelectItem value="verbas">Verbas Comerciais</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Severidade *</Label>
                  <Select
                    value={editingRule.severity || 'warning'}
                    onValueChange={(val: 'info' | 'warning' | 'critical') =>
                      setEditingRule({ ...editingRule, severity: val })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informativo (Info)</SelectItem>
                      <SelectItem value="warning">Atenção (Warning)</SelectItem>
                      <SelectItem value="critical">Crítico (Urgente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Tipo do Limite *</Label>
                  <Select
                    value={editingRule.threshold_type || 'quantidade'}
                    onValueChange={(val: ThresholdType) =>
                      setEditingRule({ ...editingRule, threshold_type: val })
                    }
                    disabled={!editingRule.is_custom && editingRule.threshold_type === 'evento'}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor_moeda">Valor em Moeda (R$)</SelectItem>
                      <SelectItem value="percentual">Percentual (%)</SelectItem>
                      <SelectItem value="quantidade">Quantidade / Saldo</SelectItem>
                      <SelectItem value="dias">Prazo em Dias</SelectItem>
                      <SelectItem value="evento">Ocorrência de Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    {getThresholdLabel(editingRule.threshold_type)}
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editingRule.threshold_value ?? 0}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        threshold_value: Number(e.target.value),
                      })
                    }
                    disabled={editingRule.threshold_type === 'evento'}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold">Descrição e Orientações</Label>
                  <Textarea
                    rows={2}
                    value={editingRule.description || ''}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, description: e.target.value })
                    }
                    placeholder="Instruções operacionais sobre quando e por que este alerta é disparado..."
                    className="text-sm"
                  />
                </div>

                {editingRule.is_custom && (
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-semibold">Condição Customizada (Opcional)</Label>
                    <Input
                      value={editingRule.custom_condition || ''}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, custom_condition: e.target.value })
                      }
                      placeholder="Ex: campo == 'valor' ou regra específica da operação"
                      className="h-9 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2 sm:col-span-2 border-t border-border pt-3">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#005B2E]" />
                    Usuários Responsáveis (Notificação no Sistema e E-mail)
                  </Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1.5 bg-muted/20">
                    {users.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2">
                        Nenhum usuário encontrado.
                      </p>
                    ) : (
                      users.map((u) => {
                        const isSelected = (editingRule.recipient_user_ids || []).includes(u.id)
                        return (
                          <label
                            key={u.id}
                            className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                          >
                            <span className="font-medium text-foreground">
                              {u.name}{' '}
                              <span className="text-muted-foreground">({u.email || u.login})</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = editingRule.recipient_user_ids || []
                                const updated = e.target.checked
                                  ? [...current, u.id]
                                  : current.filter((id) => id !== u.id)
                                setEditingRule({ ...editingRule, recipient_user_ids: updated })
                              }}
                              className="rounded border-gray-300 text-[#005B2E] focus:ring-[#005B2E] w-4 h-4"
                            />
                          </label>
                        )
                      })
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Os usuários selecionados receberão comunicados automáticos quando o alerta for
                    gerado.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setEditingRule(null)
              }}
              disabled={savingRule}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={savingRule}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {savingRule ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Salvar Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tem certeza que deseja excluir esta regra personalizada de alerta? Esta ação não pode
              ser desfeita e será auditada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
