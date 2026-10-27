import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Calculator,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  HelpCircle,
  FileText,
  ShieldAlert,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import {
  FiscalOperation,
  FiscalCfopRule,
  DetermineCfopInputItem,
  DeterminationOutput,
  evaluateCfopMatrix,
} from '@/lib/fiscal-cfop-engine'
import { fiscalCfopService } from '@/lib/fiscal-cfop-service'

export function ScreenSimuladorCfop() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [operations, setOperations] = useState<FiscalOperation[]>([])
  const [rules, setRules] = useState<FiscalCfopRule[]>([])
  const [loadingConfig, setLoadingConfig] = useState(true)

  // Cenário de simulação
  const [operacaoCodigo, setOperacaoCodigo] = useState('VENDA_NORMAL')
  const [ufEmitente, setUfEmitente] = useState('SP')
  const [ufDestinatario, setUfDestinatario] = useState('SP')
  const [isExterior, setIsExterior] = useState(false)
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 10))

  // Itens simulados
  const [itens, setItens] = useState<DetermineCfopInputItem[]>([
    {
      item_id: 'item-1',
      codigo: 'PROD-FAB-001',
      descricao: 'Item A (Ex: Fabricação própria Gran Romano / Revenda na Dec Eldorado)',
      procedencia: 'producao_propria',
      quantidade: 10,
      valor_unitario: 150.0,
    },
    {
      item_id: 'item-2',
      codigo: 'PROD-REV-002',
      descricao: 'Item B (Mercadoria Adquirida de Terceiros / Revenda)',
      procedencia: 'mercadoria_terceiros',
      quantidade: 5,
      valor_unitario: 80.0,
    },
  ])

  // Resultado
  const [simResult, setSimResult] = useState<DeterminationOutput | null>(null)
  const [running, setRunning] = useState(false)

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

  useEffect(() => {
    const load = async () => {
      setLoadingConfig(true)
      try {
        const [ops, rls] = await Promise.all([
          fiscalCfopService.getOperations(empresaAtivaId, true),
          fiscalCfopService.getCfopRules(empresaAtivaId),
        ])
        setOperations(ops)
        setRules(rls)
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar dados do simulador',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoadingConfig(false)
      }
    }
    load()
  }, [empresaAtivaId])

  const handleSimulate = () => {
    setRunning(true)
    try {
      const output = evaluateCfopMatrix(
        {
          operacao_codigo: operacaoCodigo,
          empresa_id: empresaAtivaId,
          uf_emitente: ufEmitente,
          uf_destinatario: ufDestinatario,
          is_exterior: isExterior,
          data_competencia: dataCompetencia,
          itens,
        },
        operations,
        rules,
      )
      setSimResult(output)
      if (output.tem_bloqueio) {
        toast({
          title: 'Bloqueio de Ambiguidade Detectado',
          description: output.motivo_bloqueio,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'CFOPs Resolvidos com Sucesso',
          description: `${output.total_resolvidos} item(ns) classificados com explicação auditável.`,
        })
      }
    } finally {
      setRunning(false)
    }
  }

  const handleAddItem = () => {
    const newItem: DetermineCfopInputItem = {
      item_id: `item-${Date.now()}`,
      codigo: `PROD-00${itens.length + 1}`,
      descricao: `Novo Produto Item #${itens.length + 1}`,
      procedencia: 'mercadoria_terceiros',
      quantidade: 1,
      valor_unitario: 100.0,
    }
    setItens([...itens, newItem])
  }

  const handleRemoveItem = (idx: number) => {
    if (itens.length <= 1) return
    setItens(itens.filter((_, i) => i !== idx))
  }

  const handleItemChange = (idx: number, field: keyof DetermineCfopInputItem, val: any) => {
    const updated = [...itens]
    updated[idx] = { ...updated[idx], [field]: val }
    setItens(updated)
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Simulador de Determinação de CFOP
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Motor Auditável por Item
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Simule a escolha única da operação de negócio e verifique como a matriz resolve o CFOP
              por item, apresentando a explicação detalhada de cada regra e travando ambiguidades.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSimulate}
          disabled={running || loadingConfig}
          className="bg-[#005B2E] hover:bg-[#004222] text-white font-bold text-xs gap-1.5 self-start md:self-auto"
        >
          <Play className="w-4 h-4 fill-current" />
          {running ? 'Processando Regras...' : 'Simular Resolução de CFOP'}
        </Button>
      </div>

      {/* AVISO DO DOCUMENTO DE ARQUITETURA */}
      <Card className="border-2 border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Caso Didático do Documento HURAM
            </h2>
            <p className="text-xs text-emerald-900 leading-relaxed">
              <strong>Venda Normal:</strong>
              <br />• Item com produção própria + dentro do estado = <strong>CFOP 5.101</strong>
              <br />• Item com produção própria + outro estado = <strong>CFOP 6.101</strong>
              <br />• Mercadoria adquirida de terceiros (revenda) + dentro do estado ={' '}
              <strong>CFOP 5.102</strong>
              <br />• Mercadoria adquirida de terceiros (revenda) + outro estado ={' '}
              <strong>CFOP 6.102</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PARÂMETROS DA OPERAÇÃO COMERCIAL */}
      <Card>
        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#005B2E]" />
            1. Parâmetros da Operação Comercial (Decisão Única do Vendedor)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Operação Comercial (CGO)</Label>
              <Select value={operacaoCodigo} onValueChange={setOperacaoCodigo}>
                <SelectTrigger className="h-9 font-bold text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operations.map((op) => (
                    <SelectItem key={op.codigo} value={op.codigo}>
                      {op.nome} ({op.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">UF Emitente (Origem)</Label>
              <Input
                value={ufEmitente}
                maxLength={2}
                onChange={(e) => setUfEmitente(e.target.value.toUpperCase())}
                className="h-9 font-mono font-bold text-center"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">UF Destinatário</Label>
              <Input
                value={ufDestinatario}
                maxLength={2}
                disabled={isExterior}
                onChange={(e) => setUfDestinatario(e.target.value.toUpperCase())}
                className="h-9 font-mono font-bold text-center"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Data de Competência</Label>
              <Input
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={isExterior}
                onChange={(e) => setIsExterior(e.target.checked)}
                className="rounded text-[#005B2E] w-4 h-4"
              />
              Destinatário no Exterior (Exportação)
            </label>
            <div className="text-[11px] text-muted-foreground">
              Destino calculado:{' '}
              <span className="font-bold text-foreground">
                {isExterior
                  ? 'Exterior'
                  : ufEmitente === ufDestinatario
                    ? 'Dentro do Estado (Interno)'
                    : 'Fora do Estado (Interestadual)'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ITENS DO DOCUMENTO / PEDIDO */}
      <Card>
        <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#005B2E]" />
            2. Itens do Documento (A Procedência Pode Variar por Empresa)
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddItem}
            className="text-xs h-7 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
          >
            + Adicionar Item
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {itens.map((item, idx) => (
            <div
              key={item.item_id || idx}
              className="p-3 bg-muted/20 border rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
            >
              <div className="md:col-span-3 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Código / Referência</Label>
                <Input
                  value={item.codigo}
                  onChange={(e) => handleItemChange(idx, 'codigo', e.target.value)}
                  className="h-8 font-mono"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Descrição do Item</Label>
                <Input
                  value={item.descricao}
                  onChange={(e) => handleItemChange(idx, 'descricao', e.target.value)}
                  className="h-8"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <Label className="text-[11px] text-muted-foreground">
                  Procedência nesta Empresa
                </Label>
                <Select
                  value={item.procedencia}
                  onValueChange={(v: any) => handleItemChange(idx, 'procedencia', v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="producao_propria">Fabricação Própria</SelectItem>
                    <SelectItem value="mercadoria_terceiros">
                      Mercadoria de Terceiros (Revenda)
                    </SelectItem>
                    <SelectItem value="materia_prima">Matéria-Prima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1 space-y-1">
                <Label className="text-[11px] text-muted-foreground">Qtd</Label>
                <Input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => handleItemChange(idx, 'quantidade', Number(e.target.value))}
                  className="h-8 font-mono"
                />
              </div>

              <div className="md:col-span-1 flex items-end justify-end pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={itens.length <= 1}
                  onClick={() => handleRemoveItem(idx)}
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                  title="Remover Item"
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* RESULTADO DA DETERMINAÇÃO */}
      {simResult && (
        <Card
          className={
            simResult.tem_bloqueio
              ? 'border-2 border-rose-300 bg-rose-50/30'
              : 'border-2 border-emerald-300 bg-emerald-50/30'
          }
        >
          <CardHeader className="py-3 px-4 bg-muted/40 border-b flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              {simResult.tem_bloqueio ? (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#005B2E]" />
              )}
              <CardTitle className="text-sm font-bold text-foreground">
                Resultado da Resolução de CFOP por Item
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={
                simResult.tem_bloqueio
                  ? 'border-rose-400 bg-rose-100 text-rose-800 font-bold'
                  : 'border-emerald-400 bg-emerald-100 text-emerald-800 font-bold'
              }
            >
              {simResult.tem_bloqueio
                ? 'Emissão Bloqueada (Ambiguidade/Ausência)'
                : `${simResult.total_resolvidos} de ${simResult.total_itens} Itens Resolvidos`}
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {simResult.tem_bloqueio && simResult.motivo_bloqueio && (
              <div className="p-3 bg-rose-100 border border-rose-300 rounded-lg text-rose-900 text-xs font-medium">
                <strong>Motivo do Bloqueio:</strong> {simResult.motivo_bloqueio}
              </div>
            )}

            <div className="space-y-3">
              {simResult.itens.map((res, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border shadow-sm space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-muted-foreground">#{i + 1}</span>
                      <span className="font-bold text-foreground">
                        {res.codigo} — {res.descricao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {res.status === 'sucesso' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">CFOP Resolvido:</span>
                          <span className="font-mono font-black text-lg text-[#005B2E]">
                            {res.cfop}
                          </span>
                        </div>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 border-rose-300">
                          Bloqueado ({res.status})
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Explicação da Regra Utilizada */}
                  <div className="p-2.5 bg-muted/30 rounded border text-[11px] text-foreground font-medium flex items-start gap-2">
                    <span className="text-muted-foreground shrink-0 font-bold">Explicação:</span>
                    <span>{res.explicacao}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground pt-1">
                    <div>
                      Procedência:{' '}
                      <span className="font-semibold text-foreground">
                        {res.procedencia_usada === 'producao_propria'
                          ? 'Produção Própria'
                          : 'Mercadoria Terceiros'}
                      </span>
                    </div>
                    <div>
                      Destino:{' '}
                      <span className="font-semibold text-foreground">
                        {res.destino_classificado === 'dentro_estado'
                          ? 'Dentro do Estado'
                          : res.destino_classificado === 'fora_estado'
                            ? 'Fora do Estado'
                            : 'Exterior'}
                      </span>
                    </div>
                    <div>
                      Regra ID / Versão:{' '}
                      <span className="font-mono font-semibold text-foreground">
                        {res.regra_id ? `v${res.regra_versao}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      Exemplo Didático:{' '}
                      <span className="font-semibold text-foreground">
                        {res.is_exemplo_didatico ? 'Sim (Validar Fiscal)' : 'Regra Validada'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
