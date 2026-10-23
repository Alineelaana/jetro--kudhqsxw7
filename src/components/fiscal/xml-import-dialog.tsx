import React, { useState, useRef } from 'react'
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Eye,
  RefreshCw,
  X,
  FileCheck2,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

interface XmlImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function XmlImportDialog({ open, onOpenChange, onSuccess }: XmlImportDialogProps) {
  const { empresasDisponiveis, empresaAtivaId } = useBrand()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('')
  const [xmlContent, setXmlContent] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)

  const [analyzing, setAnalyzing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [duplicateData, setDuplicateData] = useState<any>(null)
  const [viewingXml, setViewingXml] = useState(false)

  // Selecionar empresa padrão ao abrir
  React.useEffect(() => {
    if (open) {
      if (empresaAtivaId) {
        setSelectedEmpresaId(empresaAtivaId)
      } else if (empresasDisponiveis.length > 0) {
        setSelectedEmpresaId(empresasDisponiveis[0].id)
      }
      setXmlContent('')
      setFileName('')
      setPreviewData(null)
      setDuplicateData(null)
      setViewingXml(false)
    }
  }, [open, empresaAtivaId, empresasDisponiveis])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo XML de NF-e válido.',
        variant: 'destructive',
      })
      return
    }

    setFileName(file.name)
    setFileSize(file.size)
    setPreviewData(null)
    setDuplicateData(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || ''
      setXmlContent(text)
      analyzeXml(text)
    }
    reader.readAsText(file)
  }

  const analyzeXml = async (text: string) => {
    if (!selectedEmpresaId) {
      toast({
        title: 'Selecione a empresa destinatária',
        description: 'Escolha Dec Eldorado ou Gran Romano para validar a entrada.',
        variant: 'destructive',
      })
      return
    }

    setAnalyzing(true)
    try {
      const res = await pb.send('/backend/v1/huram/fiscal/xml-entry', {
        method: 'POST',
        body: {
          empresa_id: selectedEmpresaId,
          xml_content: text,
          dry_run: true,
        },
      })

      if (res?.is_duplicate) {
        setDuplicateData(res)
        toast({
          title: 'Atenção: Nota já importada!',
          description: `Chave ${res.chave_acesso} já consta no sistema com idempotência estrita.`,
        })
      } else if (res?.success) {
        setPreviewData(res)
        toast({
          title: 'XML Pré-validado com Sucesso',
          description: `NF-e ${res.numero_nota || ''} lida com ${res.items?.length || 0} itens.`,
        })
      } else {
        toast({
          title: 'Erro na análise do XML',
          description: res?.error || 'Não foi possível ler os dados da NF-e.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Falha ao analisar XML',
        description: err?.message || 'Erro de conexão com o backend.',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!xmlContent || !selectedEmpresaId) return

    setImporting(true)
    try {
      const res = await pb.send('/backend/v1/huram/fiscal/xml-entry', {
        method: 'POST',
        body: {
          empresa_id: selectedEmpresaId,
          xml_content: xmlContent,
          dry_run: false,
        },
      })

      if (res?.is_duplicate) {
        setDuplicateData(res)
        toast({
          title: 'Importação barrada por Idempotência',
          description: 'Esta nota fiscal já foi registrada anteriormente.',
        })
      } else if (res?.success) {
        toast({
          title: 'NF-e de Entrada Importada!',
          description: res.has_pending_matching
            ? 'Nota salva com itens pendentes de vinculação De-Para de produto.'
            : 'Nota importada e estoque integrado conforme regras do ERP.',
        })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: 'Erro ao importar NF-e',
          description: res?.error || 'Falha no processamento.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Falha na importação',
        description: err?.message || 'Erro inesperado.',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-primary" />
              <div>
                <DialogTitle className="text-base font-bold">
                  Importação de NF-e de Entrada via XML (Idempotente)
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Chave de 44 dígitos única, De-Para de fornecedor e movimentação de estoque
                  auditada
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
                <SelectTrigger className="w-52 h-8 text-xs font-semibold">
                  <SelectValue placeholder="Empresa Destinatária" />
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
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Caixa de Upload de XML */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xml,text/xml"
            className="hidden"
          />

          {!xmlContent ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/60 hover:bg-muted/30 cursor-pointer transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Selecione ou arraste o arquivo XML da NF-e
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Compatível com NF-e modelo 55 (Layout SEFAZ 4.00). A chave de acesso é validada
                  para garantir idempotência estrita.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
              >
                Localizar Arquivo XML
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileCode className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-2">
                    {fileName}
                    <Badge variant="outline" className="text-[10px]">
                      {(fileSize / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Carregado na memória. Pronto para validação e gravação.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingXml(!viewingXml)}
                  className="h-8 text-xs gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {viewingXml ? 'Ocultar XML' : 'Ver Conteúdo XML'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setXmlContent('')
                    setFileName('')
                    setPreviewData(null)
                    setDuplicateData(null)
                  }}
                  className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                  Trocar
                </Button>
              </div>
            </div>
          )}

          {viewingXml && xmlContent && (
            <div className="p-3 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] max-h-60 overflow-y-auto border border-border">
              <pre>{xmlContent}</pre>
            </div>
          )}

          {/* Caso 1: Idempotência - Nota já importada */}
          {duplicateData && (
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Aviso de Idempotência: NF-e já cadastrada no sistema
              </div>
              <p className="text-xs text-amber-900/80 dark:text-amber-200">
                Esta nota fiscal (chave de 44 dígitos:{' '}
                <span className="font-mono font-bold">{duplicateData.chave_acesso}</span>) já foi
                importada anteriormente no sistema em{' '}
                <span className="font-bold">
                  {duplicateData.data_importacao
                    ? new Date(duplicateData.data_importacao).toLocaleString('pt-BR')
                    : 'data anterior'}
                </span>
                . O sistema bloqueia duplicidades para evitar contaminação de estoque e financeiro.
              </p>
              {duplicateData.existing_invoice_number && (
                <div className="text-xs font-semibold text-amber-900 dark:text-amber-200 pt-1">
                  Número do lançamento existente: {duplicateData.existing_invoice_number}
                </div>
              )}
            </div>
          )}

          {/* Caso 2: Preview da Nota Pré-validada */}
          {previewData && !duplicateData && (
            <div className="space-y-4">
              {/* Cabeçalho da NF-e */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Número / Série
                  </span>
                  <div className="text-sm font-bold font-mono text-primary">
                    NF-e {previewData.numero_nota || '—'} / Série {previewData.serie || '1'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Emissão: {previewData.data_emissao}
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Fornecedor Emitente
                  </span>
                  <div className="text-xs font-bold truncate">
                    {previewData.fornecedor?.nome || '—'}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    CNPJ: {previewData.fornecedor?.cnpj || '—'} ({previewData.fornecedor?.uf || '—'}
                    )
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Total Produtos / NF
                  </span>
                  <div className="text-sm font-bold font-mono text-foreground">
                    R$ {previewData.totais?.valor_total || '0.00'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Prod: R$ {previewData.totais?.valor_produtos || '0.00'} | Frete: R${' '}
                    {previewData.totais?.frete || '0.00'}
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    Status De-Para
                  </span>
                  <div>
                    {previewData.pending_items_count > 0 ? (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold">
                        {previewData.pending_items_count} pendente(s) de de-para
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                        100% itens vinculados
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {previewData.items?.length || 0} produtos no XML
                  </div>
                </div>
              </div>

              {/* Chave de Acesso */}
              <div className="p-2 bg-muted/30 rounded border text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-[11px] truncate">
                  <span className="text-muted-foreground font-semibold">Chave de Acesso:</span>
                  <span className="font-bold text-foreground tracking-wide">
                    {previewData.chave_acesso}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                  44 Dígitos Válidos
                </Badge>
              </div>

              {/* Avisos e Divergências */}
              {previewData.warnings && previewData.warnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1 text-amber-800 dark:text-amber-300">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Avisos da Validação:
                  </div>
                  {previewData.warnings.map((w: string, idx: number) => (
                    <div key={idx}>• {w}</div>
                  ))}
                </div>
              )}

              {/* Tabela de Itens e De-Para */}
              <div className="border rounded-lg overflow-hidden text-xs">
                <div className="bg-muted/40 px-3 py-2 border-b font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" />
                    Itens da NF-e e Matching com Cadastro Interno (supplier_product_refs)
                  </span>
                  <span className="text-muted-foreground font-normal text-[11px]">
                    {previewData.items?.length || 0} itens
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-muted/20 text-[11px] font-semibold text-muted-foreground sticky top-0 border-b">
                      <tr>
                        <th className="py-2 px-3 text-left">#</th>
                        <th className="py-2 px-3 text-left">Produto no XML (Fornecedor)</th>
                        <th className="py-2 px-right text-right">Qtd XML</th>
                        <th className="py-2 px-3 text-right">Valor Unit.</th>
                        <th className="py-2 px-3 text-right">Total Item</th>
                        <th className="py-2 px-3 text-left">Status De-Para</th>
                        <th className="py-2 px-3 text-left">Produto Interno HURAM</th>
                        <th className="py-2 px-3 text-right">Estoque Interno</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {previewData.items?.map((it: any) => (
                        <tr key={it.item_index} className={it.matched ? '' : 'bg-amber-500/5'}>
                          <td className="py-2 px-3 font-mono text-[11px]">{it.item_index}</td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-foreground truncate max-w-xs">
                              {it.description}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Cód: {it.supplier_code} | NCM: {it.ncm} | CFOP: {it.cfop}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            R$ {parseFloat(it.unit_price).toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            R$ {parseFloat(it.total_price).toFixed(2)}
                          </td>
                          <td className="py-2 px-3">
                            {it.matched ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-semibold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Vinculado
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-semibold flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> Sem De-Para
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {it.matched ? (
                              <div>
                                <div className="font-semibold text-foreground truncate max-w-xs">
                                  {it.matched_product_name}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  Cód: {it.matched_product_code} (Fator: {it.conversion_factor})
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-700 dark:text-amber-400 text-[11px] italic">
                                Ficará pendente de vinculação
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {it.matched ? (
                              <span className="text-emerald-700 dark:text-emerald-400">
                                +{it.internal_quantity} {it.internal_unit}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t bg-muted/20 shrink-0 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Movimentação de estoque auditada e sem duplicação de chave
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={!previewData || !!duplicateData || importing || analyzing}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-9 gap-1"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmar Importação de Entrada
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
