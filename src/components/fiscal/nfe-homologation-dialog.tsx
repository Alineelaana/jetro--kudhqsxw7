import React, { useState, useEffect } from 'react'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Send,
  Eye,
  ShieldAlert,
  KeyRound,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Building2,
  Clock,
} from 'lucide-react'
import { pb } from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { useBrand } from '@/hooks/use-brand'

interface NfeHomologationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function NfeHomologationDialog({
  open,
  onOpenChange,
  onSuccess,
}: NfeHomologationDialogProps) {
  const { empresasDisponiveis, empresaAtivaId } = useBrand()

  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('')
  const [serie, setSerie] = useState('1')
  const [numeroNota, setNumeroNota] = useState('')
  const [naturezaOperacao, setNaturezaOperacao] = useState('VENDA DE MERCADORIAS')
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>('homologacao')

  // Destinatário
  const [destNome, setDestNome] = useState('CLIENTE TESTE HOMOLOGACAO')
  const [destDoc, setDestDoc] = useState('00000000000191')
  const [destUf, setDestUf] = useState('ES')
  const [destCidade, setDestCidade] = useState('SERRA')

  // Itens
  const [itemDesc, setItemDesc] = useState('GRANITO PRETO SAO GABRIEL POLIDO')
  const [itemNcm, setItemNcm] = useState('68029390')
  const [itemCfop, setItemCfop] = useState('5102')
  const [itemQtd, setItemQtd] = useState('10')
  const [itemVUn, setItemVUn] = useState('150.00')

  const [loading, setLoading] = useState(false)
  const [transmitting, setTransmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [viewXml, setViewXml] = useState(false)
  const [sefazTransmissionError, setSefazTransmissionError] = useState<any>(null)

  useEffect(() => {
    if (open) {
      if (empresaAtivaId) {
        setSelectedEmpresaId(empresaAtivaId)
      } else if (empresasDisponiveis.length > 0) {
        setSelectedEmpresaId(empresasDisponiveis[0].id)
      }
      setNumeroNota(String(Math.floor(1000 + Math.random() * 9000)))
      setResult(null)
      setSefazTransmissionError(null)
      setViewXml(false)
    }
  }, [open, empresaAtivaId, empresasDisponiveis])

  const handleGenerate = async () => {
    if (!selectedEmpresaId) {
      toast({
        title: 'Selecione a empresa emissora',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setSefazTransmissionError(null)

    try {
      const resp = await pb.send('/backend/v1/huram/fiscal/nfe-generate', {
        method: 'POST',
        body: {
          empresa_id: selectedEmpresaId,
          serie,
          numero_nota: numeroNota,
          ambiente,
          natureza_operacao: naturezaOperacao,
          destinatario: {
            nome: destNome,
            cnpj: destDoc,
            uf: destUf,
            cidade: destCidade,
          },
          itens: [
            {
              name: itemDesc,
              ncm: itemNcm,
              cfop: itemCfop,
              quantity: itemQtd,
              unit_price: itemVUn,
              unit: 'M2',
            },
          ],
        },
      })

      if (resp && resp.success) {
        setResult(resp)
        toast({
          title: 'NF-e Gerada em Homologação!',
          description: `Chave ${resp.chave_acesso} calculada e validada no layout PL_009_V400.`,
        })
        onSuccess()
      } else {
        toast({
          title: 'Erro na geração da NF-e',
          description: resp?.error || 'Falha ao processar regras fiscais',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro de comunicação',
        description: err?.message || 'Falha ao conectar com o serviço fiscal',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTransmitSefaz = async () => {
    if (!result?.chave_acesso) return

    setTransmitting(true)
    setSefazTransmissionError(null)

    try {
      const resp = await pb.send('/backend/v1/huram/fiscal/nfe-transmit', {
        method: 'POST',
        body: {
          chave_acesso: result.chave_acesso,
          ambiente,
        },
      })

      if (resp?.success) {
        toast({
          title: 'NF-e Transmitida com Sucesso',
          description: 'Protocolo de autorização recebido da SEFAZ.',
        })
      }
    } catch (err: any) {
      // Como não há certificado A1 configurado, o backend retorna status 422 com detalhes claros
      const data = err?.data || {}
      setSefazTransmissionError(data)
      toast({
        title: 'Transmissão SEFAZ Interrompida',
        description: data.error || 'Requer certificado digital A1 para transmissão real.',
        variant: 'destructive',
      })
    } finally {
      setTransmitting(false)
    }
  }

  const handleDownloadXml = () => {
    if (!result?.xml) return
    const blob = new Blob([result.xml], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `NFe_${result.chave_acesso}.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  Emissão de NF-e em Ambiente de Homologação (SEFAZ Testes)
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-500/10 text-amber-800 border-amber-300"
                  >
                    Sem Valor Fiscal
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Geração de XML modelo 55 layout v4.00, cálculo de tributos e validação de schema
                </p>
              </div>
            </div>

            <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
              <SelectTrigger className="w-52 h-8 text-xs font-semibold">
                <SelectValue placeholder="Empresa Emissora" />
              </SelectTrigger>
              <SelectContent>
                {empresasDisponiveis.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome_fantasia || emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Parâmetros da Nota */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/10 p-3 rounded-lg border border-border">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Série / Número</Label>
              <div className="flex gap-1">
                <Input
                  value={serie}
                  onChange={(e) => setSerie(e.target.value)}
                  className="h-8 text-xs w-16 font-mono"
                  placeholder="Série"
                />
                <Input
                  value={numeroNota}
                  onChange={(e) => setNumeroNota(e.target.value)}
                  className="h-8 text-xs flex-1 font-mono font-bold"
                  placeholder="Número NF"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Ambiente SEFAZ</Label>
              <Select value={ambiente} onValueChange={(v: any) => setAmbiente(v)}>
                <SelectTrigger className="h-8 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homologacao">Homologação (Testes SEFAZ)</SelectItem>
                  <SelectItem value="producao" disabled>
                    Produção (Requer Certificado Oficial)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-semibold">Natureza da Operação</Label>
              <Input
                value={naturezaOperacao}
                onChange={(e) => setNaturezaOperacao(e.target.value)}
                className="h-8 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Destinatário e Item de Teste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-card rounded-lg border space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Dados do Destinatário
              </span>
              <div className="space-y-1.5">
                <Input
                  value={destNome}
                  onChange={(e) => setDestNome(e.target.value)}
                  placeholder="Razão Social / Nome"
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-3 gap-1.5">
                  <Input
                    value={destDoc}
                    onChange={(e) => setDestDoc(e.target.value)}
                    placeholder="CNPJ/CPF"
                    className="h-8 text-xs font-mono col-span-2"
                  />
                  <Input
                    value={destUf}
                    onChange={(e) => setDestUf(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="UF"
                    className="h-8 text-xs font-mono text-center"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-card rounded-lg border space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Item da NF-e para Simulação
              </span>
              <div className="space-y-1.5">
                <Input
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Descrição do Produto"
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-4 gap-1.5">
                  <Input
                    value={itemNcm}
                    onChange={(e) => setItemNcm(e.target.value)}
                    placeholder="NCM"
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    value={itemCfop}
                    onChange={(e) => setItemCfop(e.target.value)}
                    placeholder="CFOP"
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    value={itemQtd}
                    onChange={(e) => setItemQtd(e.target.value)}
                    placeholder="Qtd"
                    className="h-8 text-xs font-mono"
                  />
                  <Input
                    value={itemVUn}
                    onChange={(e) => setItemVUn(e.target.value)}
                    placeholder="V. Unit"
                    className="h-8 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resultado da Geração da NF-e */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        XML Modelo 55 Gerado e Validado com Sucesso!
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Chave:{' '}
                        <span className="font-bold text-foreground">{result.chave_acesso}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewXml(!viewXml)}
                      className="h-8 text-xs gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {viewXml ? 'Ocultar XML' : 'Ver XML'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadXml}
                      className="h-8 text-xs gap-1 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar XML
                    </Button>
                  </div>
                </div>

                {/* Resumo dos Valores Calculados */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Valor Produtos
                    </span>
                    <div className="font-bold font-mono">R$ {result.totais?.valor_produtos}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      ICMS Próprio
                    </span>
                    <div className="font-bold font-mono">R$ {result.totais?.icms}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      PIS / COFINS
                    </span>
                    <div className="font-bold font-mono">
                      R${' '}
                      {(
                        parseFloat(result.totais?.pis || '0') +
                        parseFloat(result.totais?.cofins || '0')
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Valor Total NF-e
                    </span>
                    <div className="font-bold font-mono text-primary text-sm">
                      R$ {result.totais?.total_nf}
                    </div>
                  </div>
                </div>
              </div>

              {viewXml && (
                <div className="p-3 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] max-h-60 overflow-y-auto border border-border">
                  <pre>{result.xml}</pre>
                </div>
              )}

              {/* Botão de Transmissão para Teste SEFAZ */}
              <div className="p-3 bg-card border rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Transmitir para WebService SEFAZ de Homologação
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Envia o lote para o ambiente de testes da SEFAZ estadual via canal seguro.
                  </div>
                </div>

                <Button
                  onClick={handleTransmitSefaz}
                  disabled={transmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8 gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {transmitting ? 'Conectando SEFAZ...' : 'Transmitir em Homologação'}
                </Button>
              </div>

              {/* Box de Transparência Técnica / Pendência Externa Explícita */}
              {sefazTransmissionError && (
                <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    Pendência Externa Declarada: Certificado Digital A1 Obrigatório
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed">
                    {sefazTransmissionError.pendencia_externa_detalhes?.motivo ||
                      sefazTransmissionError.error}
                  </p>
                  <div className="pt-1">
                    <span className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300">
                      Requisitos Externos para Emissão Real:
                    </span>
                    <ul className="list-disc list-inside mt-1 text-xs space-y-0.5 text-amber-900/80 dark:text-amber-200">
                      <li>
                        Certificado Digital A1 (.pfx) emitido por Autoridade Certificadora
                        ICP-Brasil.
                      </li>
                      <li>
                        Credenciamento da empresa como emissora no portal da SEFAZ estadual (ES ou
                        SP).
                      </li>
                      <li>
                        Injeção da credencial segura nas variáveis do backend para assinatura
                        digital (XML-DSig).
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t bg-muted/20 shrink-0 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            Conformidade SEFAZ PL_009_V400 e integridade contábil
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>

            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-9 gap-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Gerando XML...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar NF-e em Homologação
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
