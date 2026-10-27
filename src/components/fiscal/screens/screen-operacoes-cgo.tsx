import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Info,
  ArrowRight,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { pb } from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { FiscalOperation } from '@/lib/fiscal-cfop-engine'

export function ScreenOperacoesCgo() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [operations, setOperations] = useState<FiscalOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrupo, setFilterGrupo] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOp, setEditingOp] = useState<FiscalOperation | null>(null)

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    grupo_gerencial: 'vendas' as FiscalOperation['grupo_gerencial'],
    descricao: '',
    empresa_id: '',
    filial_id: '',
    efeito_estoque: 'baixa' as FiscalOperation['efeito_estoque'],
    efeito_financeiro: 'gera_receber' as FiscalOperation['efeito_financeiro'],
    efeito_comissao: true,
    efeito_contabilizacao: 'receita_bruta_vendas',
    movimento_comercial: true,
    finalidade_nfe: '1' as FiscalOperation['finalidade_nfe'],
    ativa: true,
  })

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return (
      emp?.nome_fantasia ||
      emp?.razao_social ||
      brand?.nomeExibicao ||
      brand?.empresaNome ||
      'Todas as Empresas'
    )
  }, [empresasDisponiveis, empresaAtivaId, brand])

  const loadOperations = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('fiscal_operations').getFullList<FiscalOperation>({
        sort: 'codigo',
      })
      setOperations(records)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar operações',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperations()
  }, [])

  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesSearch =
        op.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.descricao && op.descricao.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesGrupo = filterGrupo === 'todos' || op.grupo_gerencial === filterGrupo

      // Escopo de empresa (mostra globais ou vinculadas à empresa ativa se filtrado)
      const matchesEmpresa = !empresaAtivaId || !op.empresa_id || op.empresa_id === empresaAtivaId

      return matchesSearch && matchesGrupo && matchesEmpresa
    })
  }, [operations, searchTerm, filterGrupo, empresaAtivaId])

  const handleOpenCreate = () => {
    setEditingOp(null)
    setFormData({
      codigo: '',
      nome: '',
      grupo_gerencial: 'vendas',
      descricao: '',
      empresa_id: empresaAtivaId || '',
      filial_id: '',
      efeito_estoque: 'baixa',
      efeito_financeiro: 'gera_receber',
      efeito_comissao: true,
      efeito_contabilizacao: 'receita_bruta_vendas',
      movimento_comercial: true,
      finalidade_nfe: '1',
      ativa: true,
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (op: FiscalOperation) => {
    setEditingOp(op)
    setFormData({
      codigo: op.codigo,
      nome: op.nome,
      grupo_gerencial: op.grupo_gerencial,
      descricao: op.descricao || '',
      empresa_id: op.empresa_id || '',
      filial_id: op.filial_id || '',
      efeito_estoque: op.efeito_estoque || 'baixa',
      efeito_financeiro: op.efeito_financeiro || 'gera_receber',
      efeito_comissao: op.efeito_comissao ?? true,
      efeito_contabilizacao: op.efeito_contabilizacao || '',
      movimento_comercial: op.movimento_comercial ?? true,
      finalidade_nfe: op.finalidade_nfe || '1',
      ativa: op.ativa,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        codigo: formData.codigo.trim().toUpperCase(),
      }

      if (editingOp) {
        await pb.collection('fiscal_operations').update(editingOp.id, payload)
        toast({ title: 'Operação atualizada com sucesso' })
      } else {
        await pb.collection('fiscal_operations').create(payload)
        toast({ title: 'Operação criada com sucesso' })
      }
      setDialogOpen(false)
      loadOperations()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar operação',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, nome: string) => {
    if (!window.confirm(`Deseja realmente inativar/remover a operação '${nome}'?`)) return
    try {
      await pb.collection('fiscal_operations').delete(id)
      toast({ title: 'Operação removida com sucesso' })
      loadOperations()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir operação',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Operações Comerciais & Fiscais (CGO)
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Camada 2 • Processos de Negócio
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O vendedor escolhe a operação UMA única vez (Venda normal, Bonificação, Devolução,
              etc.). Variações fiscais de CFOP são resolvidas automaticamente na Matriz por item.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold text-xs gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Operação (CGO)
        </Button>
      </div>

      {/* CARD DE ORIENTAÇÃO DA ARQUITETURA */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Princípio Fundamental: Separação de Responsabilidades (3 Camadas)
            </h2>
            <p className="text-xs text-emerald-900 leading-relaxed">
              <strong>1. Grupo Gerencial:</strong> Vendas, Devoluções, Transferências e Perdas (para
              relatórios executivos estáveis).
              <br />
              <strong>2. Operação CGO:</strong> Define o processo e efeitos operacionais (estoque,
              financeiro, comissões).
              <br />
              <strong>3. Matriz Fiscal:</strong> O CFOP é resolvido por item sem multiplicar opções
              para o vendedor e sem misturar transferências com vendas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nome ou descrição..."
              className="pl-8 text-xs h-9"
            />
          </div>

          <Select value={filterGrupo} onValueChange={setFilterGrupo}>
            <SelectTrigger className="w-44 text-xs h-9">
              <SelectValue placeholder="Grupo Gerencial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Grupos</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="devolucoes">Devoluções</SelectItem>
              <SelectItem value="transferencias">Transferências</SelectItem>
              <SelectItem value="remessas">Remessas</SelectItem>
              <SelectItem value="perdas">Perdas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">
          Total de {filteredOperations.length} operações cadastradas
        </div>
      </div>

      {/* TABELA DE OPERAÇÕES */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Nome da Operação</th>
                <th className="py-2.5 px-3">Grupo Gerencial</th>
                <th className="py-2.5 px-3">Efeitos Operacionais</th>
                <th className="py-2.5 px-3">Comissão</th>
                <th className="py-2.5 px-3">Finalidade NF-e</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    Carregando operações fiscais...
                  </td>
                </tr>
              ) : filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-muted-foreground">
                    Nenhuma operação comercial encontrada para os filtros.
                  </td>
                </tr>
              ) : (
                filteredOperations.map((op) => (
                  <tr key={op.id} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#005B2E]">{op.codigo}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground">{op.nome}</div>
                      {op.descricao && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {op.descricao}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="capitalize font-semibold">
                        {op.grupo_gerencial}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Estoque:</span>
                        <span className="font-semibold capitalize text-foreground">
                          {op.efeito_estoque || 'nenhum'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Financeiro:</span>
                        <span className="font-semibold text-foreground">
                          {op.efeito_financeiro === 'gera_receber'
                            ? 'A Receber'
                            : op.efeito_financeiro === 'gera_pagar'
                              ? 'A Pagar'
                              : 'Nenhum'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {op.efeito_comissao ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                          Gera Comissão
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Não</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {op.finalidade_nfe === '1'
                        ? '1 - Normal'
                        : op.finalidade_nfe === '4'
                          ? '4 - Devolução'
                          : op.finalidade_nfe === '3'
                            ? '3 - Ajuste'
                            : '2 - Complementar'}
                    </td>
                    <td className="py-2.5 px-3">
                      {op.ativa ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ativa
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" /> Inativa
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(op)}
                          className="h-7 w-7 p-0"
                          title="Editar Operação"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(op.id, op.nome)}
                          className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Excluir Operação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              {editingOp ? `Editar Operação: ${editingOp.codigo}` : 'Nova Operação Comercial (CGO)'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Código da Operação *</Label>
                <Input
                  required
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                  }
                  placeholder="EX: VENDA_NORMAL"
                  disabled={!!editingOp}
                  className="font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Nome Amigável *</Label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Venda Normal de Mercadoria"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Grupo Gerencial (Relatórios) *</Label>
                <Select
                  value={formData.grupo_gerencial}
                  onValueChange={(v: any) => setFormData({ ...formData, grupo_gerencial: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="devolucoes">Devoluções</SelectItem>
                    <SelectItem value="transferencias">Transferências</SelectItem>
                    <SelectItem value="remessas">Remessas</SelectItem>
                    <SelectItem value="perdas">Perdas</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Finalidade da NF-e *</Label>
                <Select
                  value={formData.finalidade_nfe}
                  onValueChange={(v: any) => setFormData({ ...formData, finalidade_nfe: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - NF-e Normal</SelectItem>
                    <SelectItem value="2">2 - NF-e Complementar</SelectItem>
                    <SelectItem value="3">3 - NF-e de Ajuste</SelectItem>
                    <SelectItem value="4">4 - Devolução de Mercadoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Descrição do Processo Operacional</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Exemplo: Venda de produtos fabricados ou revendidos com faturamento normal"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Efeito no Estoque</Label>
                <Select
                  value={formData.efeito_estoque}
                  onValueChange={(v: any) => setFormData({ ...formData, efeito_estoque: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa Física</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="reserva">Reserva</SelectItem>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Efeito Financeiro</Label>
                <Select
                  value={formData.efeito_financeiro}
                  onValueChange={(v: any) => setFormData({ ...formData, efeito_financeiro: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gera_receber">Gera Contas a Receber</SelectItem>
                    <SelectItem value="gera_pagar">Gera Contas a Pagar</SelectItem>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Contabilização</Label>
                <Input
                  value={formData.efeito_contabilizacao}
                  onChange={(e) =>
                    setFormData({ ...formData, efeito_contabilizacao: e.target.value })
                  }
                  placeholder="receita_bruta_vendas"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.efeito_comissao}
                  onChange={(e) => setFormData({ ...formData, efeito_comissao: e.target.checked })}
                  className="rounded text-[#005B2E] w-4 h-4"
                />
                Gera Comissão / Remuneração Variável
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.movimento_comercial}
                  onChange={(e) =>
                    setFormData({ ...formData, movimento_comercial: e.target.checked })
                  }
                  className="rounded text-[#005B2E] w-4 h-4"
                />
                É Movimento Comercial Real (Evita dupla contagem)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="rounded text-[#005B2E] w-4 h-4"
                />
                Operação Ativa
              </label>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold"
              >
                Salvar Operação
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
