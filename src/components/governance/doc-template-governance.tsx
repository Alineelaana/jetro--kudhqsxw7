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
      setDoc((found.items[0] as GovernanceDocument & { id: string }) || null)
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
        for (const it of res.items) mapa[it.item_key] = it.confirmed
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
        if (existentes.items.length > 0) return existentes.items[0] as GovernanceDocument
        const criado = (await pb.collection('governance_documents').create({
          empresa: template.company || '',
          title: template.name || 'Documento sem título',
          template_id: template.id,
          project_code: (template.category || 'outros').toUpperCase().slice(0, 12),
          type_code: 'MOP',
          status: 'em_elaboracao',
          classification: 'interno',
          pending_review: true,
          change_summary: 'Criado a partir do Modelo de Documento (esteira de governança).',
        })) as GovernanceDocument
        return criado
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
      const docs = await pb.collection('governance_documents').getFullList<GovernanceDocument>({
        sort: '-created',
      })
      const mapa: Record<string, GovernanceDocument> = {}
      for (const d of docs) {
        if (d.template_id) mapa[d.template_id] = d
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
