import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import {
  Building2,
  Plus,
  Landmark,
  Settings2,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react'
import { CnabService } from '@/services/cnab'
import { BANCOS_FEBRABAN, type CnabConfig } from '@/lib/cnab/types'

export function ScreenCnabConfiguracoes() {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<CnabConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Formulário de Convênio
  const [formData, setFormData] = useState<Partial<CnabConfig>>({
    nome_convenio: '',
    banco_codigo: '001',
    banco_nome: 'Banco do Brasil',
    layout_padrao: 'CNAB 240',
    ambiente: 'homologacao',
    tipo_cobranca: 'ambos',
    agencia: '',
    agencia_digito: '',
    conta: '',
    conta_digito: '',
    convenio: '',
    cedente_nome: '',
    cedente_codigo: '',
    cedente_cnpj_cpf: '',
    carteira: '17',
    variacao_carteira: '019',
    chave_pix: '',
    sequencial_remessa: 1,
    multa_percentual: '2.00',
    juros_mora_mensal: '1.00',
    dias_baixa_devolucao: 29,
    dias_protesto: 0,
    instrucoes_cobranca_1: 'Sr. Caixa, não receber após 30 dias do vencimento.',
    instrucoes_cobranca_2: 'Cobrar juros de mora diária de 1% ao mês após vencimento.',
    ativo: true,
    observacoes: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await CnabService.listConfigs()
      setConfigs(data)
    } catch {
      toast({
        title: 'Erro ao carregar convênios',
        description: 'Não foi possível buscar as configurações CNAB.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenNew = () => {
    setFormData({
      nome_convenio: '',
      banco_codigo: '001',
      banco_nome: 'Banco do Brasil',
      layout_padrao: 'CNAB 240',
      ambiente: 'homologacao',
      tipo_cobranca: 'ambos',
      agencia: '',
      agencia_digito: '',
      conta: '',
      conta_digito: '',
      convenio: '',
      cedente_nome: '',
      cedente_codigo: '',
      cedente_cnpj_cpf: '',
      carteira: '17',
      variacao_carteira: '019',
      chave_pix: '',
      sequencial_remessa: 1,
      multa_percentual: '2.00',
      juros_mora_mensal: '1.00',
      dias_baixa_devolucao: 29,
      dias_protesto: 0,
      instrucoes_cobranca_1: 'Sr. Caixa, não receber após 30 dias do vencimento.',
      instrucoes_cobranca_2: 'Cobrar juros de mora diária de 1% ao mês após vencimento.',
      ativo: true,
      observacoes: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (conf: CnabConfig) => {
    setFormData({ ...conf })
    setDialogOpen(true)
  }

  const handleBancoChange = (code: string) => {
    const b = BANCOS_FEBRABAN.find((item) => item.codigo === code)
    setFormData((prev) => ({
      ...prev,
      banco_codigo: code,
      banco_nome: b ? b.nome.split(' - ')[1] : 'Outro Banco',
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome_convenio || !formData.agencia || !formData.conta || !formData.convenio) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha o Nome do Convênio, Agência, Conta e Código do Convênio.',
        variant: 'destructive',
      })
      return
    }

    try {
      await CnabService.saveConfig(formData)
      toast({
        title: 'Configuração Salva',
        description: 'O convênio bancário CNAB foi gravado com sucesso.',
      })
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao Salvar Convênio',
        description: err?.message || 'Falha na validação das regras bancárias.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await CnabService.deleteConfig(deletingId)
      toast({
        title: 'Convênio Removido',
        description: 'Configuração de convênio excluída com sucesso.',
      })
      setDeletingId(null)
      loadData()
    } catch {
      toast({
        title: 'Erro ao Excluir',
        description: 'Não foi possível excluir o convênio bancário.',
        variant: 'destructive',
      })
    }
  }

  const columns: JetroColumnDef<CnabConfig>[] = [
    {
      id: 'nome_convenio',
      header: 'Convênio / Identificação',
      accessorKey: 'nome_convenio',
      dataType: 'text',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.nome_convenio}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Landmark className="w-3 h-3" /> {row.banco_codigo} - {row.banco_nome}
          </span>
        </div>
      ),
    },
    {
      id: 'layout_padrao',
      header: 'Layout & Ambiente',
      accessorKey: 'layout_padrao',
      dataType: 'text',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className="text-xs font-semibold bg-slate-50 text-slate-800 border-slate-300"
          >
            {row.layout_padrao}
          </Badge>
          <Badge
            variant={row.ambiente === 'producao' ? 'default' : 'secondary'}
            className={
              row.ambiente === 'producao' ? 'bg-emerald-600 text-white text-xs' : 'text-xs'
            }
          >
            {row.ambiente === 'producao' ? 'Produção' : 'Homologação'}
          </Badge>
        </div>
      ),
    },
    {
      id: 'agencia_conta',
      header: 'Agência / Conta / Carteira',
      dataType: 'text',
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5">
          <div>
            <span className="text-muted-foreground">Ag:</span> {row.agencia}
            {row.agencia_digito ? `-${row.agencia_digito}` : ''} |{' '}
            <span className="text-muted-foreground">Cc:</span> {row.conta}-{row.conta_digito}
          </div>
          <div>
            <span className="text-muted-foreground">Cart:</span> {row.carteira}
            {row.variacao_carteira ? `/${row.variacao_carteira}` : ''} |{' '}
            <span className="text-muted-foreground">Conv:</span> {row.convenio}
          </div>
        </div>
      ),
    },
    {
      id: 'cedente',
      header: 'Cedente / Beneficiário',
      dataType: 'text',
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{row.cedente_nome}</div>
          <div className="text-muted-foreground">Cód: {row.cedente_codigo}</div>
        </div>
      ),
    },
    {
      id: 'sequencial_remessa',
      header: 'Próxima Remessa',
      accessorKey: 'sequencial_remessa',
      dataType: 'number',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs bg-muted/40">
          Seq: #{String(row.sequencial_remessa || 1).padStart(4, '0')}
        </Badge>
      ),
    },
    {
      id: 'ativo',
      header: 'Status',
      accessorKey: 'ativo',
      dataType: 'text',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            row.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {row.ativo ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      id: 'acoes',
      header: 'Ações',
      sortable: false,
      draggable: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
            title="Editar Convênio"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingId(row.id)}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Excluir Convênio"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-[var(--brand-primary,#063D30)]" />
              Configuração de Convênios CNAB
            </h1>
            <Badge
              variant="outline"
              className="text-xs border-[var(--brand-primary,#063D30)] text-[var(--brand-primary,#063D30)]"
            >
              Módulo Bancário
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre e gerencie os convênios de cobrança e débito FEBRABAN CNAB 240 e CNAB 400 por
            empresa e banco.
          </p>
        </div>

        <Button
          onClick={handleOpenNew}
          className="bg-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/90 text-white gap-2 font-medium"
        >
          <Plus className="w-4 h-4" /> Novo Convênio
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Convênios Ativos
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {configs.filter((c) => c.ativo).length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Configurados para transmissão FEBRABAN
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Layouts Disponíveis
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">CNAB 240 & 400</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            Padrão 240 recomendado e 400 para bancos legados
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-medium">
              Ambiente de Operação
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {configs.some((c) => c.ambiente === 'producao') ? 'Produção Ativa' : 'Homologação'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Auditoria e controle sequencial por convênio
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Convênios */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[var(--brand-primary,#063D30)]" />
            Convênios Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <JetroTable
            screenId="cnab.configuracoes"
            columns={columns}
            data={configs}
            loading={loading}
            emptyMessage="Nenhum convênio bancário cadastrado. Clique em 'Novo Convênio' para iniciar."
          />
        </CardContent>
      </Card>

      {/* Diálogo de Edição / Criação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Landmark className="w-5 h-5 text-[var(--brand-primary,#063D30)]" />
              {formData.id ? 'Editar Convênio Bancário' : 'Novo Convênio Bancário CNAB'}
            </DialogTitle>
            <DialogDescription>
              Defina os parâmetros técnicos e comerciais do convênio bancário para geração de
              remessa e processamento de retornos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {/* Bloco 1: Identificação Básica */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="nome_convenio" className="text-xs font-semibold">
                  Nome do Convênio *
                </Label>
                <Input
                  id="nome_convenio"
                  placeholder="Ex: Banco do Brasil - Carteira 17 Cobrança"
                  value={formData.nome_convenio || ''}
                  onChange={(e) => setFormData({ ...formData, nome_convenio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="banco_codigo" className="text-xs font-semibold">
                  Banco (FEBRABAN) *
                </Label>
                <Select value={formData.banco_codigo || '001'} onValueChange={handleBancoChange}>
                  <SelectTrigger id="banco_codigo">
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS_FEBRABAN.map((b) => (
                      <SelectItem key={b.codigo} value={b.codigo}>
                        {b.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bloco 2: Layout, Ambiente e Tipo de Cobrança */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-lg border">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Layout Padrão</Label>
                <Select
                  value={formData.layout_padrao || 'CNAB 240'}
                  onValueChange={(val: any) => setFormData({ ...formData, layout_padrao: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNAB 240">CNAB 240 (Recomendado)</SelectItem>
                    <SelectItem value="CNAB 400">CNAB 400 (Legado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Ambiente</Label>
                <Select
                  value={formData.ambiente || 'homologacao'}
                  onValueChange={(val: any) => setFormData({ ...formData, ambiente: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homologacao">Homologação / Testes</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tipo de Cobrança</Label>
                <Select
                  value={formData.tipo_cobranca || 'ambos'}
                  onValueChange={(val: any) => setFormData({ ...formData, tipo_cobranca: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleto">Somente Boleto</SelectItem>
                    <SelectItem value="pix">Somente PIX</SelectItem>
                    <SelectItem value="ambos">Híbrido (Boleto + PIX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bloco 3: Dados Bancários da Conta */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Agência *</Label>
                <Input
                  value={formData.agencia || ''}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  placeholder="0001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Dígito Ag.</Label>
                <Input
                  value={formData.agencia_digito || ''}
                  onChange={(e) => setFormData({ ...formData, agencia_digito: e.target.value })}
                  placeholder="9"
                  maxLength={2}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold">Conta Corrente *</Label>
                <Input
                  value={formData.conta || ''}
                  onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  placeholder="1234567"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Dígito Cta *</Label>
                <Input
                  value={formData.conta_digito || ''}
                  onChange={(e) => setFormData({ ...formData, conta_digito: e.target.value })}
                  placeholder="0"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            {/* Bloco 4: Convênio, Carteira e Cedente */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Código Convênio *</Label>
                <Input
                  value={formData.convenio || ''}
                  onChange={(e) => setFormData({ ...formData, convenio: e.target.value })}
                  placeholder="Ex: 1234567"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Carteira *</Label>
                <Input
                  value={formData.carteira || ''}
                  onChange={(e) => setFormData({ ...formData, carteira: e.target.value })}
                  placeholder="Ex: 17 ou 09"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Variação Carteira</Label>
                <Input
                  value={formData.variacao_carteira || ''}
                  onChange={(e) => setFormData({ ...formData, variacao_carteira: e.target.value })}
                  placeholder="Ex: 019"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Próx. Sequencial Remessa</Label>
                <Input
                  type="number"
                  value={formData.sequencial_remessa || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, sequencial_remessa: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                />
              </div>
            </div>

            {/* Bloco 5: Dados do Cedente / Beneficiário */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Razão Social / Nome Cedente *</Label>
                <Input
                  value={formData.cedente_nome || ''}
                  onChange={(e) => setFormData({ ...formData, cedente_nome: e.target.value })}
                  placeholder="Nome registrado na conta"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Código Cedente *</Label>
                <Input
                  value={formData.cedente_codigo || ''}
                  onChange={(e) => setFormData({ ...formData, cedente_codigo: e.target.value })}
                  placeholder="Código fornecido pelo banco"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CNPJ / CPF Cedente</Label>
                <Input
                  value={formData.cedente_cnpj_cpf || ''}
                  onChange={(e) => setFormData({ ...formData, cedente_cnpj_cpf: e.target.value })}
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>

            {/* Bloco 6: Multa, Juros e Prazos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/10 p-3 rounded border">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Multa (%)</Label>
                <Input
                  value={formData.multa_percentual || ''}
                  onChange={(e) => setFormData({ ...formData, multa_percentual: e.target.value })}
                  placeholder="2.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Juros Mora Mensal (%)</Label>
                <Input
                  value={formData.juros_mora_mensal || ''}
                  onChange={(e) => setFormData({ ...formData, juros_mora_mensal: e.target.value })}
                  placeholder="1.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Dias Baixa/Devolução</Label>
                <Input
                  type="number"
                  value={formData.dias_baixa_devolucao || 29}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dias_baixa_devolucao: parseInt(e.target.value) || 29,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Dias Protesto (0 = Não)</Label>
                <Input
                  type="number"
                  value={formData.dias_protesto || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, dias_protesto: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Bloco 7: Instruções e PIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Chave PIX (Para Cobrança Híbrida)</Label>
                <Input
                  value={formData.chave_pix || ''}
                  onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                  placeholder="CNPJ, e-mail, telefone ou chave aleatória"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.ativo ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  id="ativo-switch"
                />
                <Label htmlFor="ativo-switch" className="text-xs font-semibold cursor-pointer">
                  Convênio Ativo para Emissão
                </Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Instruções Impressas no Boleto</Label>
              <Input
                value={formData.instrucoes_cobranca_1 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, instrucoes_cobranca_1: e.target.value })
                }
                placeholder="Linha 1 de instruções"
                className="mb-1"
              />
              <Input
                value={formData.instrucoes_cobranca_2 || ''}
                onChange={(e) =>
                  setFormData({ ...formData, instrucoes_cobranca_2: e.target.value })
                }
                placeholder="Linha 2 de instruções"
              />
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[var(--brand-primary,#063D30)] hover:bg-[var(--brand-primary,#063D30)]/90 text-white"
              >
                Salvar Convênio
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta configuração de convênio CNAB? Esta ação não
              afetará os lotes de remessa e retornos já processados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir Convênio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
