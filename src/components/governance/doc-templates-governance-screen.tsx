import { useState } from 'react'
import { Loader2, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigCrudScreen } from '@/components/configuracoes/config-crud-screen'
import type { ConfigCrudExtraColumn } from '@/components/configuracoes/config-crud-screen'
import { DOC_TEMPLATE_CONFIG } from '@/lib/configuracoes-config'
import { CLASSIFICACAO_LABEL } from '@/services/governance'
import type { GovernanceDocument } from '@/services/governance'
import {
  GovernanceDocBadge,
  GovernanceFlowDialog,
  useDocTemplateGovernance,
  useGovernanceDocColumns,
} from '@/components/governance/doc-template-governance'

/**
 * Tela Modelos de Documento com esteira de governança AvatarSi:
 * colunas de governança, botão Fluxo e criação idempotente do registro
 * em governance_documents (template_id) ao salvar o modelo.
 */

export function DocTemplatesGovernanceScreen() {
  const [reloadKey, setReloadKey] = useState(0)
  const { docsByTemplate, loading: loadingDocs } = useGovernanceDocColumns(reloadKey)
  const { flowDoc, abrirFluxo, garantirGovernanca } = useDocTemplateGovernance()

  const recarregar = () => setReloadKey((k) => k + 1)

  const aposSalvar = async (saved: {
    id: string
    name?: string
    category?: string
    company?: string
  }) => {
    if (!saved?.id) return
    await garantirGovernanca({
      id: saved.id,
      name: saved.name,
      category: saved.category,
      company: saved.company,
    })
    recarregar()
  }

  const colunas: ConfigCrudExtraColumn[] = [
    {
      header: 'Número',
      render: (r) => {
        const d: GovernanceDocument | undefined = docsByTemplate[r.id]
        return d ? (
          <span className="font-mono text-xs font-semibold text-foreground">
            {String(d.doc_number).padStart(6, '0')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{loadingDocs ? '…' : 'Pendência'}</span>
        )
      },
    },
    {
      header: 'Código',
      render: (r) => {
        const d: GovernanceDocument | undefined = docsByTemplate[r.id]
        return d ? (
          <span className="font-mono text-xs font-semibold text-[#005B2E]">{d.doc_code}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
      },
    },
    {
      header: 'Versão',
      render: (r) => {
        const d: GovernanceDocument | undefined = docsByTemplate[r.id]
        return d ? (
          <span className="font-mono text-xs">V{d.version}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
      },
    },
    {
      header: 'Classificação',
      render: (r) => {
        const d: GovernanceDocument | undefined = docsByTemplate[r.id]
        return d ? (
          <span className="text-xs">
            {CLASSIFICACAO_LABEL[d.classification] || d.classification}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
      },
    },
    {
      header: 'Status',
      render: (r) => {
        const d: GovernanceDocument | undefined = docsByTemplate[r.id]
        if (!d)
          return (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300">
              Pendência de governança
            </span>
          )
        return (
          <span className="inline-flex items-center gap-1">
            <GovernanceDocBadge status={d.status} />
            {d.pending_review && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300"
                title="Documento antigo integrado pelo backfill sem presumir aprovação"
              >
                Pendência
              </span>
            )}
          </span>
        )
      },
    },
  ]

  const abrirFluxoDoModelo = async (r: {
    id: string
    name?: string
    category?: string
    company?: string
  }) => {
    const existente: GovernanceDocument | undefined = docsByTemplate[r.id]
    if (existente) {
      abrirFluxo(existente)
      return
    }
    // Modelo sem registro (ex.: criado fora da esteira): cria idempotente e abre o fluxo.
    const criado = await garantirGovernanca(r)
    recarregar()
    if (criado) abrirFluxo(criado)
  }

  const acoesExtras = (r: any) => {
    const d: GovernanceDocument | undefined = docsByTemplate[r.id]
    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-[#005B2E] h-8 px-2 font-bold"
        title="Fluxo de governança"
        aria-label={`Fluxo de governança de ${String(r.name || 'modelo')}`}
        onClick={() => abrirFluxoDoModelo(r)}
      >
        <GitBranch className="w-3.5 h-3.5" />
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <ConfigCrudScreen
        config={DOC_TEMPLATE_CONFIG}
        extraColumns={colunas}
        extraActions={acoesExtras}
        onAfterCreate={aposSalvar}
        onAfterUpdate={aposSalvar}
      />
      {loadingDocs && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Carregando dados de governança…
        </p>
      )}
      <GovernanceFlowDialog
        doc={flowDoc}
        onClose={() => abrirFluxo(null)}
        onTransitioned={recarregar}
      />
    </div>
  )
}
