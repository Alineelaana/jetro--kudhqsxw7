import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Save, ArrowUp, ArrowDown, Loader2, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getAlcadasConfig,
  saveAlcadasConfig,
  getPriorizacaoConfig,
  savePriorizacaoConfig,
  getCobrancaTemplates,
  saveCobrancaTemplate,
  type AlcadasConfig,
  type PriorizacaoConfig,
  type CobrancaTemplate,
} from '@/services/collection-center-config'

const COBRANCA_TIPO_LABELS: Record<string, string> = {
  pre_vencimento: 'Pré-Vencimento',
  vencimento: 'Vencimento',
  promessa_quebrada: 'Promessa Quebrada',
  aviso_final: 'Aviso Final',
}

export default function CollectionCenterConfig() {
  const [tab, setTab] = useState('alcadas')
  const [alcadas, setAlcadas] = useState<AlcadasConfig | null>(null)
  const [priorizacao, setPriorizacao] = useState<PriorizacaoConfig | null>(null)
  const [templates, setTemplates] = useState<CobrancaTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editTemplate, setEditTemplate] = useState<CobrancaTemplate | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [a, p, t] = await Promise.all([
        getAlcadasConfig(),
        getPriorizacaoConfig(),
        getCobrancaTemplates(),
      ])
      setAlcadas(a)
      setPriorizacao(p)
      setTemplates(t)
    } catch {
      toast({ title: 'Erro ao carregar configurações', variant: 'destructive' })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSaveAlcadas = async () => {
    if (!alcadas) return
    setSaving(true)
    try {
      await saveAlcadasConfig(alcadas)
      toast({ title: 'Alçadas salvas com sucesso' })
    } catch {
      toast({ title: 'Erro ao salvar alçadas', variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleSavePriorizacao = async () => {
    if (!priorizacao) return
    setSaving(true)
    try {
      await savePriorizacaoConfig(priorizacao)
      toast({ title: 'Priorização salva com sucesso' })
    } catch {
      toast({ title: 'Erro ao salvar priorização', variant: 'destructive' })
    }
    setSaving(false)
  }

  const moveRule = (index: number, dir: -1 | 1) => {
    if (!priorizacao) return
    const rules = [...priorizacao.rules]
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= rules.length) return
    ;[rules[index], rules[newIndex]] = [rules[newIndex], rules[index]]
    rules.forEach((r, i) => {
      r.order = i + 1
    })
    setPriorizacao({ ...priorizacao, rules })
  }

  const handleSaveTemplate = async (data: Partial<CobrancaTemplate>) => {
    if (!editTemplate) return
    setSaving(true)
    try {
      await saveCobrancaTemplate(editTemplate.id, data)
      toast({ title: 'Template salvo com sucesso' })
      setEditTemplate(null)
      await loadAll()
    } catch {
      toast({ title: 'Erro ao salvar template', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/financeiro/cobrancas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configuração da Central de Cobrança</h1>
          <p className="text-sm text-muted-foreground">
            Alçadas, priorização da fila e templates de cobrança
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="alcadas">Alçadas</TabsTrigger>
          <TabsTrigger value="priorizacao">Priorização</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="alcadas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alçadas de Desconto por Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alcadas &&
                (['cobrador', 'supervisor', 'gerente'] as const).map((profile) => (
                  <div key={profile} className="grid grid-cols-3 items-end gap-4">
                    <div>
                      <Label className="capitalize">{profile}</Label>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Desconto Máximo (%)</Label>
                      <Input
                        type="number"
                        value={alcadas[profile].percent}
                        onChange={(e) =>
                          setAlcadas({
                            ...alcadas,
                            [profile]: {
                              ...alcadas[profile],
                              percent: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Valor Máximo (R$)</Label>
                      <Input
                        type="number"
                        value={alcadas[profile].valor}
                        onChange={(e) =>
                          setAlcadas({
                            ...alcadas,
                            [profile]: {
                              ...alcadas[profile],
                              valor: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              <p className="text-xs text-muted-foreground">
                Descontos acima da alçada do perfil são enviados para aprovação via Workflow
                existente (financial_approvals).
              </p>
              <Button onClick={handleSaveAlcadas} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alçadas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorizacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Priorização da Fila</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground mb-4">
                Ordene os critérios de priorização. A fila refletirá a nova ordenação imediatamente
                após salvar.
              </p>
              {priorizacao?.rules.map((rule, index) => (
                <div key={rule.key} className="flex items-center gap-3 p-2 rounded-lg border">
                  <span className="text-sm font-mono w-6 text-center">{index + 1}</span>
                  <span className="flex-1 text-sm font-medium">{rule.label}</span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Peso</Label>
                    <Input
                      type="number"
                      className="w-20 h-8"
                      value={rule.weight}
                      onChange={(e) => {
                        const rules = [...priorizacao.rules]
                        rules[index] = { ...rule, weight: parseInt(e.target.value) || 0 }
                        setPriorizacao({ ...priorizacao, rules })
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveRule(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveRule(index, 1)}
                    disabled={index === priorizacao.rules.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleSavePriorizacao} disabled={saving} className="mt-4">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Priorização
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Cobrança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((tpl) => {
                let canais: string[] = []
                let dest: any = {}
                try {
                  canais = JSON.parse(tpl.canais || '[]')
                } catch {
                  /* intentionally ignored */
                }
                try {
                  dest = JSON.parse(tpl.destinatarios || '{}')
                } catch {
                  /* intentionally ignored */
                }
                return (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{tpl.name}</span>
                        <Badge variant="secondary">
                          {COBRANCA_TIPO_LABELS[tpl.cobranca_tipo] || tpl.cobranca_tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Canais: {canais.join(', ') || 'N/A'}</span>
                        {dest.primary && <span>· Destinatário: {dest.primary}</span>}
                        {dest.cc && dest.cc.length > 0 && <span>· CC: {dest.cc.join(', ')}</span>}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditTemplate(tpl)}>
                          <Pencil className="h-3 w-3 mr-1" /> Editar
                        </Button>
                      </DialogTrigger>
                      {editTemplate?.id === tpl.id && (
                        <TemplateEditDialog
                          template={editTemplate}
                          onSave={handleSaveTemplate}
                          saving={saving}
                        />
                      )}
                    </Dialog>
                  </div>
                )
              })}
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum template encontrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TemplateEditDialog({
  template,
  onSave,
  saving,
}: {
  template: CobrancaTemplate
  onSave: (data: Partial<CobrancaTemplate>) => void
  saving: boolean
}) {
  const [name, setName] = useState(template.name)
  const [subject, setSubject] = useState(template.subject || '')
  const [body, setBody] = useState(template.body)
  const [canais, setCanais] = useState<string[]>(
    (() => {
      try {
        return JSON.parse(template.canais || '[]')
      } catch {
        return []
      }
    })(),
  )
  const [destData, setDestData] = useState<any>(() => {
    try {
      return JSON.parse(template.destinatarios || '{}')
    } catch {
      return {}
    }
  })

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Editar Template</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Assunto</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label>Conteúdo</Label>
          <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Canais</Label>
          <div className="flex gap-4">
            {['whatsapp', 'email', 'sms'].map((ch) => (
              <div key={ch} className="flex items-center gap-2">
                <Checkbox
                  id={`ch-${ch}`}
                  checked={canais.includes(ch)}
                  onCheckedChange={(v) =>
                    setCanais(v ? [...canais, ch] : canais.filter((c) => c !== ch))
                  }
                />
                <Label htmlFor={`ch-${ch}`} className="text-sm capitalize">
                  {ch}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Destinatário Principal</Label>
            <select
              className="w-full border rounded p-2"
              value={destData.primary || ''}
              onChange={(e) => setDestData({ ...destData, primary: e.target.value })}
            >
              <option value="cliente">Cliente</option>
              <option value="cobrador">Cobrador</option>
              <option value="supervisor">Supervisor</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">CC (separado por vírgula)</Label>
            <Input
              value={(destData.cc || []).join(', ')}
              onChange={(e) =>
                setDestData({
                  ...destData,
                  cc: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
        <Button
          onClick={() =>
            onSave({
              name,
              subject,
              body,
              canais: JSON.stringify(canais),
              destinatarios: JSON.stringify(destData),
            })
          }
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Template
        </Button>
      </div>
    </DialogContent>
  )
}
