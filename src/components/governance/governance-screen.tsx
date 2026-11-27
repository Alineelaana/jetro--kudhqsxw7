import { useCallback, useEffect, useMemo, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useBrand } from '@/hooks/use-brand'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, RefreshCw, FileText, ScrollText } from 'lucide-react'
import type {
  GovernanceDocument,
  GovernanceProject,
  GovernanceTipo,
  GovernanceWfc,
  GovernanceNorma,
  GovernanceNormAck,
  ChecklistItem,
} from '@/services/governance'
import {
  CLASSIFICACOES,
  ITENS_CHECKLIST,
  STATUS_LABEL,
  STATUS_BADGE,
  CLASSIFICACAO_LABEL,
  parseVersion,
  calcularProximaVersao,
  transitionAction,
  confirmChecklistItem,
  acknowledgeNorma,
} from '@/services/governance'

const DEFAULT_TIPOS = [
  ['NGD', 'Norma Geral de Documentação'],
  ['POP', 'Procedimento Operacional Padrão'],
  ['COM', 'Comunicado Oficial'],
  ['ATA', 'Ata de Reunião'],
  ['API', 'Apresentação Institucional'],
  ['APC', 'Apresentação Comercial'],
  ['AIN', 'Apresentação para Investidores'],
  ['PLN', 'Plano de Negócios'],
  ['EST', 'Estudo Estratégico'],
  ['FIN', 'Modelagem Financeira'],
  ['TRB', 'Estudo Tributário'],
  ['JUR', 'Documento Jurídico'],
  ['PRO', 'Proposta Comercial'],
  ['TEC', 'Projeto Tecnológico'],
  ['MOP', 'Manual Operacional'],
  ['GOV', 'Documento de Governança'],
  ['MKT', 'Marketing e Comunicação'],
]

const PAPIS_CONFIG = [
  ['elaboradores', 'Elaborar (redigir o documento)'],
  ['revisores_tecnicos', 'Revisar conteúdo técnico'],
  ['revisores_identidade', 'Revisar identidade visual'],
  ['revisor_juridico', 'Revisão jurídica (quando pertinente)'],
  ['revisor_fiscal', 'Revisão fiscal (quando pertinente)'],
  ['revisor_financeiro', 'Revisão financeira (quando pertinente)'],
  ['aprovador', 'Aprovar (direção ou delegado)'],
  ['liberador', 'Liberar (governança)'],
  ['divulgador', 'Divulgar (canais autorizados)'],
] as const

const ABAS = ['acervo', 'norma'] as const

export function GovernanceScreen() {
  const { brand, empresaAtivaId } = useBrand()
  const { user } = useAuth()
  const { toast } = useToast()

  const empresaId = empresaAtivaId || brand.empresaId || ''

  const [aba, setAba] = useState<(typeof ABAS)[number]>('acervo')
  const [loading, setLoading] = useState(true)
  const [documentos, setDocumentos] = useState<GovernanceDocument[]>([])
  const [projetos, setProjetos] = useState<GovernanceProject[]>([])
  const [tipos, setTipos] = useState<GovernanceTipo[]>([])
  const [wfc, setWfc] = useState<GovernanceWfc | null>(null)
  const [norma, setNorma] = useState<GovernanceNorma | null>(null)
  const [ciencias, setCiencias] = useState<GovernanceNormAck[]>([])

  const [novoOpen, setNovoOpen] = useState(false)
  const [revisaoOpen, setRevisaoOpen] = useState(false)
  const [liberarOpen, setLiberarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alvo, setAlvo] = useState<GovernanceDocument | null>(null)

  const [busca, setBusca] = useState('')

  const [novoDoc, setNovoDoc] = useState({
    title: '',
    project_code: 'GER',
    type_code: '',
    classification: 'interno',
    purpose: '',
    audience: '',
    channels: '',
  })
  const [revisaoForm, setRevisaoForm] = useState({
    change_type: 'minor',
    resumo: '',
  })
  const [liberarChecks, setLiberarChecks] = useState<Record<string, boolean>>({})

  const isSup = (user as { role?: string } | null)?.role === 'SUP'
  const podeConfigurar = isSup

  const carregar = useCallback(async () => {
    if (!empresaId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const docs = await pb
        .collection('governance_documents')
        .getFullList<GovernanceDocument>({ sort: '-created' })
      setDocumentos(docs)
      const projs = await pb
        .collection('governance_projects')
        .getFullList<GovernanceProject>({ sort: 'code' })
      setProjetos(projs)
      const tps = await pb
        .collection('governance_document_types')
        .getFullList<GovernanceTipo>({ sort: 'code' })
      setTipos(tps)
      const wfcs = await pb
        .collection('governance_workflow_config')
        .getFullList<GovernanceWfc>({ filter: `empresa="${empresaId}"`, limit: 1 })
      setWfc(wfcs[0] || null)
      const normas = await pb
        .collection('governance_norms')
        .getFullList<GovernanceNorma>({ filter: `empresa="${empresaId}"`, sort: '-created' })
      setNorma(normas[0] || null)
      if (normas[0]) {
        const aks = await pb
          .collection('governance_norm_acknowledgments')
          .getFullList<GovernanceNormAck>({ filter: `norma_id="${normas[0].id}"` })
        setCiencias(aks)
      } else {
        setCiencias([])
      }
    } catch {
      toast({
        title: 'Falha ao carregar',
        description: 'Não foi possível ler os dados de governança documental.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [empresaId, toast])

  useEffect(() => {
    carregar()
  }, [carregar])

  const resultados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return documentos
    return documentos.filter(
      (d) =>
        String(d.doc_number || '').includes(q) ||
        (d.doc_code || '').toLowerCase().includes(q) ||
        (d.title || '').toLowerCase().includes(q) ||
        (d.version || '').toLowerCase().includes(q),
    )
  }, [busca, documentos])

  const novoDocumento = async () => {
    if (!novoDoc.title || !novoDoc.type_code) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe título e tipo documental.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const rec = await pb.collection('governance_documents').create({
        empresa: empresaId,
        title: novoDoc.title,
        project_code: novoDoc.project_code || 'GER',
        type_code: novoDoc.type_code,
        classification: novoDoc.classification,
        purpose: novoDoc.purpose,
        audience: novoDoc.audience,
        channels: novoDoc.channels,
        status: 'em_elaboracao',
      })
      toast({
        title: 'Documento criado',
        description: `Número único ${rec.doc_number} — código ${rec.doc_code} — versão ${rec.version}.`,
      })
      setNovoOpen(false)
      setNovoDoc({
        title: '',
        project_code: 'GER',
        type_code: '',
        classification: 'interno',
        purpose: '',
        audience: '',
        channels: '',
      })
      await carregar()
    } catch (err) {
      toast({
        title: 'Falha ao criar documento',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const novaRevisao = async () => {
    if (!alvo) return
    if (!revisaoForm.resumo.trim()) {
      toast({
        title: 'Resumo obrigatório',
        description: 'Toda nova versão exige resumo da mudança.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const { major, minor, patch } = parseVersion(alvo.version)
      const prox = calcularProximaVersao(major, minor, patch, revisaoForm.change_type)
      const rec = await pb.collection('governance_documents').update(alvo.id, {
        version_major: prox[0],
        version_minor: prox[1],
        version_patch: prox[2],
        version: prox.join('.'),
        change_summary: `V${prox.join('.')} — ${revisaoForm.resumo.trim()}`,
        status: 'em_elaboracao',
        pending_review: true,
      })
      // devolve a esteira de revisão já com o resumo registrado
      await transitionAction(rec.id, 'enviar_revisao', prox.join('.'))
      toast({
        title: 'Nova versão em revisão',
        description: `Documento ${rec.doc_code} segue como V${prox.join('.')} — mesmo número único ${rec.doc_number}.`,
      })
      setRevisaoOpen(false)
      setAlvo(null)
      setRevisaoForm({ change_type: 'minor', resumo: '' })
      await carregar()
    } catch (err) {
      toast({
        title: 'Falha na revisão',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const abrirLiberacao = (doc: GovernanceDocument) => {
    setAlvo(doc)
    const inicial: Record<string, boolean> = {}
    for (const it of ITENS_CHECKLIST) inicial[it.key] = false
    setLiberarChecks(inicial)
    setLiberarOpen(true)
  }

  const confirmarItem = async (item: ChecklistItem) => {
    if (!alvo) return
    const prox = { ...liberarChecks, [item.key]: !liberarChecks[item.key] }
    setLiberarChecks(prox)
    if (!prox[item.key]) return // desmarcar só atualiza a UI
    try {
      await confirmChecklistItem(alvo.id, alvo.version || '0.1.0', item.key, item.label)
      toast({
        title: 'Item confirmado',
        description: `${item.label} — confirmado por ${(user as { name?: string } | null)?.name || 'usuário'}.`,
      })
    } catch (err) {
      toast({
        title: 'Falha ao confirmar item',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
      setLiberarChecks((p) => ({ ...p, [item.key]: false }))
    }
  }

  const liberar = async () => {
    if (!alvo) return
    setSaving(true)
    try {
      const res = await transitionAction(alvo.id, 'liberar', alvo.version || '0.1.0')
      toast({
        title: 'Documento liberado',
        description: `${alvo.doc_code} V${res.version} está publicado/vigente para as ações oficiais.`,
      })
      setLiberarOpen(false)
      setAlvo(null)
      await carregar()
    } catch (err) {
      toast({
        title: 'Falha ao liberar',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const acaoRapida = async (doc: GovernanceDocument, action: string) => {
    try {
      await transitionAction(doc.id, action, doc.version || '')
      await carregar()
    } catch (err) {
      toast({
        title: 'Falha na ação',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    }
  }

  const salvarNorma = async () => {
    if (!norma) return
    setSaving(true)
    try {
      await pb.collection('governance_norms').update(norma.id, {
        title: norma.title,
        content: norma.content,
        version: norma.version,
        active: norma.active,
      })
      toast({ title: 'Norma salva' })
      await carregar()
    } catch (err) {
      toast({
        title: 'Falha ao salvar norma',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const registrarCiencia = async () => {
    if (!norma) return
    try {
      await acknowledgeNorma(norma.id, {
        user_name: (user as { name?: string } | null)?.name || 'integrante',
        user_function: (user as { role?: string } | null)?.role || '',
      })
      toast({ title: 'Ciência registrada' })
      await carregar()
    } catch (err) {
      toast({
        title: 'Falha ao registrar ciência',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    }
  }

  const nomeProjeto = (code: string) => projetos.find((p) => p.code === code)?.name || code || '—'
  const nomeTipo = (code: string) => tipos.find((t) => t.code === code)?.name || code || '—'

  const tiposFiltrados = useMemo(() => {
    const lista = tipos.length
      ? tipos
      : DEFAULT_TIPOS.map(([code, name]) => ({ id: code, code, name }) as GovernanceTipo)
    return lista
  }, [tipos])

  if (!empresaId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Governança Documental</CardTitle>
          <CardDescription>
            Selecione uma empresa ativa no seletor do sistema para acessar o acervo de documentos.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-foreground">
            Governança Documental — {brand.nomeExibicao}
          </h2>
          <p className="text-sm text-muted-foreground">
            Padrão AvatarSi: número único, código documental, versões, revisão, aprovação, liberação
            e acervo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregar} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button
            onClick={() => setNovoOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <FileText className="w-4 h-4 mr-2" /> Novo Documento
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {ABAS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAba(a)}
            aria-current={aba === a ? 'page' : undefined}
            className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px ${
              aba === a
                ? 'border-[#005B2E] text-[#005B2E]'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {a === 'acervo' ? 'Acervo' : 'Norma e Ciência'}
          </button>
        ))}
      </div>

      {aba === 'acervo' && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Busca no acervo</CardTitle>
              <CardDescription>
                Pesquise por número único, código, título ou versão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={busca}
                onChange={(ev) => setBusca(ev.target.value)}
                placeholder="Ex.: 12, AVSI_NGD_001, Norma, 1.0.0"
                aria-label="Buscar documentos no acervo"
              />
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#005B2E]" />
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                {resultados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 pr-4">Número</th>
                          <th className="py-2 pr-4">Código</th>
                          <th className="py-2 pr-4">Título</th>
                          <th className="py-2 pr-4">Projeto / Tipo</th>
                          <th className="py-2 pr-4">Versão</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Classificação</th>
                          <th className="py-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((d) => (
                          <tr key={d.id} className="border-b last:border-0 align-top">
                            <td className="py-2 pr-4 font-mono">{d.doc_number}</td>
                            <td className="py-2 pr-4 font-mono">{d.doc_code}</td>
                            <td className="py-2 pr-4">
                              {d.title}
                              {d.status !== 'publicado' && d.version !== d.current_version && (
                                <span className="ml-2 text-xs font-bold text-amber-700">
                                  (vigente: V{d.current_version || '—'})
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {nomeProjeto(d.project_code)} / {nomeTipo(d.type_code)}
                            </td>
                            <td className="py-2 pr-4 font-mono">V{d.version}</td>
                            <td className="py-2 pr-4">
                              <Badge variant="outline" className={STATUS_BADGE[d.status] || ''}>
                                {d.status === 'em_elaboracao'
                                  ? 'MINUTA — EM REVISÃO'
                                  : STATUS_LABEL[d.status]}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4">
                              {CLASSIFICACAO_LABEL[d.classification] || d.classification}
                            </td>
                            <td className="py-2">
                              <div className="flex gap-1 flex-wrap">
                                {d.status === 'em_elaboracao' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => acaoRapida(d, 'enviar_revisao')}
                                  >
                                    Enviar à revisão
                                  </Button>
                                )}
                                {(d.status === 'em_revisao' || d.status === 'em_aprovacao') && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => acaoRapida(d, 'aprovar')}
                                    >
                                      Aprovar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => acaoRapida(d, 'devolver')}
                                    >
                                      Devolver
                                    </Button>
                                  </>
                                )}
                                {d.status === 'aprovado' && (
                                  <Button size="sm" onClick={() => abrirLiberacao(d)}>
                                    Liberar (vigente)
                                  </Button>
                                )}
                                {(d.status === 'em_elaboracao' ||
                                  d.status === 'obsoleto' ||
                                  d.status === 'revogado') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setAlvo(d)
                                      setRevisaoForm({ change_type: 'minor', resumo: '' })
                                      setRevisaoOpen(true)
                                    }}
                                  >
                                    Nova versão
                                  </Button>
                                )}
                                {d.status === 'publicado' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => acaoRapida(d, 'revogar')}
                                  >
                                    Revogar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {aba === 'norma' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Norma de Governança Documental</CardTitle>
            <CardDescription>
              Publica a norma da empresa e registra a ciência dos integrantes por versão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!norma ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Nenhuma norma publicada para esta empresa ainda.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      await pb.collection('governance_norms').create({
                        empresa: empresaId,
                        title: 'Norma Geral de Documentação',
                        version: '1.0.0',
                        content: '',
                        active: true,
                      })
                      await carregar()
                    } catch (err) {
                      toast({
                        title: 'Falha ao criar norma',
                        description: err instanceof Error ? err.message : String(err),
                        variant: 'destructive',
                      })
                    }
                  }}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                >
                  <ScrollText className="w-4 h-4 mr-2" /> Criar norma inicial
                </Button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="norma-title">Título da norma</Label>
                    <Input
                      id="norma-title"
                      value={norma.title}
                      onChange={(e) => setNorma({ ...norma, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="norma-version">Versão da norma</Label>
                    <Input
                      id="norma-version"
                      value={norma.version || ''}
                      onChange={(e) => setNorma({ ...norma, version: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="norma-content">Conteúdo da norma</Label>
                  <Textarea
                    id="norma-content"
                    rows={8}
                    value={norma.content || ''}
                    onChange={(e) => setNorma({ ...norma, content: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={salvarNorma}
                    disabled={saving}
                    className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar norma
                  </Button>
                  <Button variant="outline" onClick={registrarCiencia}>
                    Registrar minha ciência
                  </Button>
                </div>
                <div>
                  <Label className="text-sm font-semibold">
                    Ciência registrada ({ciencias.length})
                  </Label>
                  {ciencias.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum integrante confirmou ainda.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm">
                      {ciencias.map((c) => (
                        <li
                          key={c.id}
                          className="border rounded px-3 py-1.5 flex flex-wrap gap-2 items-center"
                        >
                          <span className="font-semibold">{c.user_name}</span>
                          <span className="text-muted-foreground">{c.user_function}</span>
                          <span className="text-muted-foreground text-xs">
                            {c.acknowledged_at
                              ? new Date(c.acknowledged_at).toLocaleString('pt-BR')
                              : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo documento de governança</DialogTitle>
            <DialogDescription>
              O número único e o código documental (PROJETO_TIPO_NNN) são gerados no primeiro
              salvamento e ficam fixos para toda a vida do documento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nd-title">Título *</Label>
              <Input
                id="nd-title"
                value={novoDoc.title}
                onChange={(e) => setNovoDoc({ ...novoDoc, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Projeto</Label>
                <Select
                  value={novoDoc.project_code}
                  onValueChange={(v) => setNovoDoc({ ...novoDoc, project_code: v })}
                >
                  <SelectTrigger aria-label="Projeto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos.map((p) => (
                      <SelectItem key={p.id} value={p.code}>
                        {p.code} — {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo documental *</Label>
                <Select
                  value={novoDoc.type_code}
                  onValueChange={(v) => setNovoDoc({ ...novoDoc, type_code: v })}
                >
                  <SelectTrigger aria-label="Tipo documental">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposFiltrados.map((t) => (
                      <SelectItem key={t.id} value={t.code}>
                        {t.code} — {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Classificação *</Label>
              <Select
                value={novoDoc.classification}
                onValueChange={(v) => setNovoDoc({ ...novoDoc, classification: v })}
              >
                <SelectTrigger aria-label="Classificação">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASSIFICACOES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="nd-finalidade">Finalidade</Label>
                <Input
                  id="nd-finalidade"
                  value={novoDoc.purpose}
                  onChange={(e) => setNovoDoc({ ...novoDoc, purpose: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="nd-publico">Público</Label>
                <Input
                  id="nd-publico"
                  value={novoDoc.audience}
                  onChange={(e) => setNovoDoc({ ...novoDoc, audience: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="nd-canais">Canais autorizados</Label>
                <Input
                  id="nd-canais"
                  value={novoDoc.channels}
                  onChange={(e) => setNovoDoc({ ...novoDoc, channels: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={novoDocumento}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revisaoOpen} onOpenChange={setRevisaoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova versão — {alvo?.doc_code}</DialogTitle>
            <DialogDescription>
              Mantém o número único {alvo?.doc_number}. A versão anterior permanece vigente enquanto
              esta não for substituída.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tipo de mudança *</Label>
              <Select
                value={revisaoForm.change_type}
                onValueChange={(v) => setRevisaoForm({ ...revisaoForm, change_type: v })}
              >
                <SelectTrigger aria-label="Tipo de mudança">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patch">Correção pontual (patch)</SelectItem>
                  <SelectItem value="minor">Evolução de conteúdo (minor)</SelectItem>
                  <SelectItem value="major">Mudança estrutural (major)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rev-resumo">Resumo da mudança *</Label>
              <Textarea
                id="rev-resumo"
                rows={4}
                value={revisaoForm.resumo}
                onChange={(e) => setRevisaoForm({ ...revisaoForm, resumo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisaoOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={novaRevisao}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Enviar à revisão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={liberarOpen} onOpenChange={setLiberarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Liberar versão {alvo?.version} — {alvo?.doc_code}
            </DialogTitle>
            <DialogDescription>
              Confirme item a item o checklist de liberação. Cada item registra quem confirmou e
              quando. A liberação só é aceita com todos os itens confirmados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {ITENS_CHECKLIST.map((item) => (
              <div key={item.key} className="flex items-start gap-3 border rounded p-3">
                <Checkbox
                  id={`chk-${item.key}`}
                  checked={!!liberarChecks[item.key]}
                  onCheckedChange={() => confirmarItem(item)}
                />
                <div>
                  <Label htmlFor={`chk-${item.key}`} className="font-semibold cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiberarOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={liberar}
              disabled={saving || ITENS_CHECKLIST.some((i) => !liberarChecks[i.key])}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Liberar como vigente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {podeConfigurar && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Papéis configurados para esta empresa</CardTitle>
            <CardDescription>
              Configure em “Configurações › Governança Documental” quem elabora, revisa, aprova,
              libera e divulga — isolado por empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wfc ? (
              <dl className="grid sm:grid-cols-2 gap-2 text-sm">
                {PAPIS_CONFIG.map(([campo, rotulo]) => (
                  <div key={campo} className="border rounded px-3 py-2 flex justify-between gap-2">
                    <dt className="text-muted-foreground">{rotulo}</dt>
                    <dd className="font-semibold text-right">
                      {(wfc as unknown as Record<string, string>)[campo] || '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                Papéis ainda não configurados para esta empresa.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
