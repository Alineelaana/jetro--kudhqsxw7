import { useCallback, useEffect, useMemo, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { RecordModel } from 'pocketbase'
import type { GovernanceDocument } from '@/services/governance'
import {
  ITENS_CHECKLIST,
  STATUS_BADGE,
  STATUS_LABEL,
  CLASSIFICACAO_LABEL,
  transitionAction,
  confirmChecklistItem,
} from '@/services/governance'

/**
 * Fluxo de governança embutido na tela Modelos de Documento: reutiliza a API
 * /backend/v1/governance/transition e /backend/v1/governance/checklist (a mesma
 * usada pela tela Governança Documental) — nenhuma lógica de transição duplicada.
 */

export function GovernanceDocBadge({ status }: { status?: string }) {
  if (!status) return null
  return (
    <Badge variant="outline" className={STATUS_BADGE[status] || ''}>
      {STATUS_LABEL[status] || status}
    </Badge>
  )
}

/**
 * Normaliza um registro PocketBase (RecordModel) para GovernanceDocument sem
 * cast direto: cada campo é lido/validado individualmente e o id é sempre string.
 */
export function normalizeGovernanceDoc(raw: RecordModel): GovernanceDocument {
  const r = raw as unknown as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0)
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  return {
    id: str(raw.id),
    empresa: str(r.empresa),
    title: str(r.title),
    project_code: str(r.project_code),
    type_code: str(r.type_code),
    doc_code: str(r.doc_code),
    doc_number: num(r.doc_number),
    version_major: num(r.version_major),
    version_minor: num(r.version_minor),
    version_patch: num(r.version_patch),
    version: str(r.version) || '0.1.0',
    current_version: str(r.current_version),
    status: (str(r.status) || 'em_elaboracao') as GovernanceDocument['status'],
    classification: (str(r.classification) || 'interno') as GovernanceDocument['classification'],
    author: str(r.author),
    reviewers: str(r.reviewers),
    approver: str(r.approver),
    approver_role: str(r.approver_role),
    purpose: str(r.purpose),
    audience: str(r.audience),
    channels: str(r.channels),
    approval_evidence: str(r.approval_evidence),
    change_summary: str(r.change_summary),
    released_file_name: str(r.released_file_name),
    released_at: str(r.released_at),
    released_by: str(r.released_by),
    approved_at: str(r.approved_at),
    pending_review: !!r.pending_review,
    created: str(r.created),
    updated: str(r.updated),
  }
}

export function useGovernanceDocForTemplate(templateId: string | null | undefined) {
  const [doc, setDoc] = useState<(GovernanceDocument & { id: string }) | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!templateId) {
      setDoc(null)
      return
    }
    setLoading(true)
    try {
      const found = await pb.collection('governance_documents').getList(1, 1, {
        filter: `template_id = "${templateId}"`,
      })
      setDoc(found.items.length > 0 ? normalizeGovernanceDoc(found.items[0]) : null)
    } catch {
      setDoc(null)
    } finally {
      setLoading(false)
    }
  }, [templateId])

  useEffect(() => {
    load()
  }, [load])

  return { doc, loading, reload: load }
}

interface FlowDialogProps {
  doc: (GovernanceDocument & { id: string }) | null
  onClose: () => void
  onTransitioned?: () => void
}

type Acao = 'enviar_revisao' | 'aprovar' | 'devolver' | 'liberar'

export function GovernanceFlowDialog({ doc, onClose, onTransitioned }: FlowDialogProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let ativo = true
    const carregar = async () => {
      if (!doc) return
      setChecks({})
      try {
        const res = await pb.collection('governance_release_checklist').getList(1, 50, {
          filter: `document_id = "${doc.id}" && version = "${doc.version || '0.1.0'}"`,
        })
        if (!ativo) return
        const mapa: Record<string, boolean> = {}
        for (const raw of res.items) {
          const it = raw as unknown as Record<string, unknown>
          const key = typeof it.item_key === 'string' ? it.item_key : ''
          if (key) mapa[key] = !!it.confirmed
        }
        setChecks(mapa)
      } catch {
        if (ativo) setChecks({})
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [doc?.id, doc?.version])

  const executar = async (action: Acao) => {
    if (!doc) return
    setSaving(true)
    try {
      if (action === 'liberar') {
        const naoConfirmados = ITENS_CHECKLIST.filter((it) => !checks[it.key])
        for (const it of naoConfirmados) {
          await confirmChecklistItem(doc.id, doc.version || '0.1.0', it.key, it.label)
        }
      }
      await transitionAction(doc.id, action, doc.version || '0.1.0')
      toast({
        title: 'Fluxo atualizado',
        description: `${doc.doc_code} V${doc.version} — transição "${action}" registrada na auditoria.`,
      })
      onTransitioned?.()
      onClose()
    } catch (err) {
      toast({
        title: 'Falha na transição',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!doc) return null

  const acoes: { acao: Acao; label: string; primario?: boolean }[] =
    doc.status === 'em_elaboracao'
      ? [{ acao: 'enviar_revisao', label: 'Enviar para revisão', primario: true }]
      : doc.status === 'em_revisao'
        ? [
            { acao: 'aprovar', label: 'Aprovar', primario: true },
            { acao: 'devolver', label: 'Devolver ao elaborador' },
          ]
        : doc.status === 'aprovado'
          ? [{ acao: 'liberar', label: 'Liberar (publicar/vigente)', primario: true }]
          : []

  const podeLiberar = doc.status === 'aprovado'
  const todosConfirmados = ITENS_CHECKLIST.every((it) => checks[it.key])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fluxo de governança — {doc.title}</DialogTitle>
          <DialogDescription>
            Número único {doc.doc_number} • Código {doc.doc_code} • Versão {doc.version} •{' '}
            {CLASSIFICACAO_LABEL[doc.classification] || doc.classification}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <GovernanceDocBadge status={doc.status} />
            {doc.pending_review && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                Pendência de governança
              </Badge>
            )}
          </div>
          {podeLiberar && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Checklist de liberação</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ITENS_CHECKLIST.map((it) => (
                  <label key={it.key} className="flex items-start gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={!!checks[it.key]}
                      onCheckedChange={(v) => setChecks((p) => ({ ...p, [it.key]: !!v }))}
                    />
                    <span>{it.label}</span>
                  </label>
                ))}
              </div>
              {!todosConfirmados && (
                <p className="text-xs text-muted-foreground">
                  Itens pendentes serão confirmados automaticamente na liberação.
                </p>
              )}
            </div>
          )}
          {acoes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma transição disponível a partir do status atual. Revogar/retomar e nova versão
              estão na tela Governança Documental.
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          {acoes.map((a) => (
            <button
              key={a.acao}
              type="button"
              onClick={() => executar(a.acao)}
              disabled={saving}
              className={
                a.primario
                  ? 'inline-flex items-center rounded-md bg-[#005B2E] px-4 py-2 text-sm font-bold text-white hover:bg-[#01361D] disabled:opacity-50'
                  : 'inline-flex items-center rounded-md border border-[#005B2E] px-4 py-2 text-sm font-bold text-[#005B2E] hover:bg-[#005B2E]/10 disabled:opacity-50'
              }
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {a.label}
            </button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------
// Integração com a tela Modelos de Documento (ConfigCrudScreen)
// ---------------------------------------------------------------

export function useDocTemplateGovernance() {
  const { toast } = useToast()
  const [flowDoc, setFlowDoc] = useState<(GovernanceDocument & { id: string }) | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  const abrirFluxo = (doc: (GovernanceDocument & { id: string }) | null) => setFlowDoc(doc)

  /**
   * Garante que o modelo tem documento de governança. Modelos antigos já
   * receberam documento no backfill 0363 (template_id preenchido); modelos
   * criados agora ganham documento ao salvar pela primeira vez.
   */
  const garantirGovernanca = useCallback(
    async (template: { id: string; name?: string; category?: string; company?: string }) => {
      try {
        const existentes = await pb.collection('governance_documents').getList(1, 1, {
          filter: `template_id = "${template.id}"`,
        })
        if (existentes.items.length > 0) return normalizeGovernanceDoc(existentes.items[0])
        const criado = await pb.collection('governance_documents').create({
          empresa: template.company || '',
          title: template.name || 'Documento sem título',
          template_id: template.id,
          project_code: (template.category || 'outros').toUpperCase().slice(0, 12),
          type_code: 'MOP',
          status: 'em_elaboracao',
          classification: 'interno',
          pending_review: true,
          change_summary: 'Criado a partir do Modelo de Documento (esteira de governança).',
        })
        return normalizeGovernanceDoc(criado)
      } catch (err) {
        toast({
          title: 'Governança documental',
          description:
            err instanceof Error
              ? `Documento salvo, mas sem registro de governança: ${err.message}`
              : 'Documento salvo, mas sem registro de governança.',
          variant: 'destructive',
        })
        return null
      }
    },
    [toast],
  )

  return { flowDoc, creating, abrirFluxo, garantirGovernanca, setCreating }
}

export function useGovernanceDocColumns(reloadKey: number) {
  const [docsByTemplate, setDocsByTemplate] = useState<Record<string, GovernanceDocument>>({})
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const docs = await pb.collection('governance_documents').getFullList({ sort: '-created' })
      const mapa: Record<string, GovernanceDocument> = {}
      for (const raw of docs) {
        const d = normalizeGovernanceDoc(raw)
        const templateId = (raw as unknown as Record<string, unknown>).template_id
        if (typeof templateId === 'string' && templateId) mapa[templateId] = d
      }
      setDocsByTemplate(mapa)
    } catch {
      setDocsByTemplate({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  return useMemo(() => ({ docsByTemplate, loading }), [docsByTemplate, loading])
}
