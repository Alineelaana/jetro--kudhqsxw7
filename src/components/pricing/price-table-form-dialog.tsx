import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { createPriceTableRecord, updatePriceTableRecord } from '@/services/price-tables'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { canViewPriceTableCosts } from '@/lib/price-table-permissions'
import {
  getInitialFormState,
  getInitialRules,
  parseItems,
  parseRules,
  type EnhancedPriceTable,
  type PriceTableItem,
  type PriceTableRules,
  type PriceTableFormState,
} from '@/lib/price-table-types'
import { PriceTableGeneralTab } from '@/components/pricing/price-table-general-tab'
import { PriceTableItemsTab } from '@/components/pricing/price-table-items-tab'
import { PriceTableRulesTab } from '@/components/pricing/price-table-rules-tab'
import { useCondicoesPagamento } from '@/components/pricing/rule-options'
import {
  prazoMedioDaTabela,
  prazoMedioTotal,
  mapearCondicoesSelecionadas,
  TOLERANCIA_PRAZO_DIAS,
  type ComparacaoPrazo,
} from '@/components/pricing/condicoes-prazo'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: EnhancedPriceTable | null
  onSuccess: () => void
}

export function PriceTableFormDialog({ open, onOpenChange, table, onSuccess }: Props) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PriceTableFormState>(getInitialFormState())
  const [items, setItems] = useState<PriceTableItem[]>([])
  const [rules, setRules] = useState<PriceTableRules>(getInitialRules())
  const [manterMesmoPrazoDivergente, setManterMesmoPrazoDivergente] = useState(false)

  const { condicoes: condicoesCatalogo } = useCondicoesPagamento()

  const canViewCosts = canViewPriceTableCosts(user?.role as string)

  useEffect(() => {
    if (open) {
      setForm({
        table_name: table?.table_name || '',
        code: table?.code || '',
        description: table?.description || '',
        table_type: table?.table_type || 'varejo',
        empresa: table?.empresa || '',
        filial: table?.filial || '',
        moeda: table?.moeda || 'BRL',
        prioridade: String(table?.prioridade ?? 0),
        tabela_base: table?.tabela_base || '',
        percentual_ajuste: table?.percentual_ajuste || '',
        status: table?.status || 'rascunho',
        observacoes: table?.observacoes || '',
        data_inicial: table?.data_inicial || '',
        data_final: table?.data_final || '',
        prazo_medio_dias:
          table?.rules?.prazo_medio_dias && table.rules.prazo_medio_dias > 0
            ? String(table.rules.prazo_medio_dias)
            : '',
      })
      setItems(parseItems(table?.items))
      setRules(parseRules(table?.rules))
      setManterMesmoPrazoDivergente(false)
      setActiveTab('general')
    }
  }, [open, table])

  const setField = (field: keyof PriceTableFormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
  }

  // Aviso de prazo médio: compara as condições escolhidas com o prazo da tabela.
  // Usa o prazo médio explícito da tabela (rules.prazo_medio_dias); se não
  // preenchido, deduz do nome/observações (ex.: "Tabela 7 dias" -> 7).
  const prazoExplicito = parseFloat(String(form.prazo_medio_dias || '').replace(',', '.')) || 0
  const prazoTabelaDias =
    prazoExplicito > 0 ? prazoExplicito : prazoMedioDaTabela(form.table_name, form.observacoes)
  const condicoesSelecionadas = mapearCondicoesSelecionadas(
    rules.condicoes_pagamento,
    condicoesCatalogo,
  )
  const prazoCondicoesDias = prazoMedioTotal(condicoesSelecionadas)
  const diferencaPrazo = prazoCondicoesDias - prazoTabelaDias
  const comparacaoPrazo: ComparacaoPrazo = {
    prazoTabela: prazoTabelaDias,
    prazoCondicoes: prazoCondicoesDias,
    diferenca: diferencaPrazo,
    divergente:
      condicoesSelecionadas.length > 0 &&
      prazoTabelaDias > 0 &&
      Math.abs(diferencaPrazo) > TOLERANCIA_PRAZO_DIAS,
  }
  const prazoDivergente = comparacaoPrazo.divergente && !manterMesmoPrazoDivergente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.table_name.trim()) {
      toast({ title: 'Informe o nome da tabela', variant: 'destructive' })
      setActiveTab('general')
      return
    }
    setSaving(true)
    try {
      if (comparacaoPrazo.divergente && !manterMesmoPrazoDivergente) {
        setActiveTab('rules')
        toast({
          title: 'Prazo médio das condições de pagamento divergente',
          description:
            `Tabela: ${comparacaoPrazo.prazoTabela.toFixed(1)} dias · ` +
            `Condições: ${comparacaoPrazo.prazoCondicoes.toFixed(1)} dias. ` +
            `Revise as condições ou confirme para manter assim.`,
          variant: 'destructive',
        })
        setSaving(false)
        return
      }
      const belowMin = items.some((it) => {
        const min = parseFloat(String(it.min_price || '0').replace(',', '.')) || 0
        const price = parseFloat(String(it.new_price || '0').replace(',', '.')) || 0
        return min > 0 && price < min
      })
      const finalStatus = belowMin && form.status === 'ativa' ? 'aguardando_aprovacao' : form.status
      const { prazo_medio_dias: _prazoForm, ...formSemPrazo } = form
      const data: Record<string, unknown> = {
        ...formSemPrazo,
        prioridade: parseInt(form.prioridade, 10) || 0,
        items,
        rules: { ...rules, prazo_medio_dias: prazoTabelaDias || 0 },
        status: finalStatus,
        responsible_user: (user?.name as string) || '',
        active: finalStatus === 'ativa',
      }
      if (table) {
        await updatePriceTableRecord(table.id, data)
        toast({ title: 'Tabela atualizada' })
      } else {
        await createPriceTableRecord(data)
        toast({ title: 'Tabela criada' })
      }
      if (belowMin) {
        toast({
          title: 'Alguns preços estão abaixo do mínimo — enviada para aprovação',
          variant: 'destructive',
        })
      }
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar tabela', variant: 'destructive' })
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            {table ? 'Editar Tabela de Preços' : 'Nova Tabela de Preços'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap h-auto">
              <TabsTrigger value="general">Dados Gerais</TabsTrigger>
              <TabsTrigger value="items" className="gap-1">
                Produtos e Serviços{items.length > 0 ? ` (${items.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="rules" className="gap-1">
                Regras de Aplicação
                {prazoDivergente && <AlertTriangle className="w-3 h-3 text-amber-500" />}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
              <PriceTableGeneralTab form={form} setField={setField} />
            </TabsContent>
            <TabsContent value="items" className="mt-4">
              <PriceTableItemsTab items={items} setItems={setItems} canViewCosts={canViewCosts} />
            </TabsContent>
            <TabsContent value="rules" className="mt-4">
              <PriceTableRulesTab
                rules={rules}
                setRules={(r) => {
                  setRules(r)
                  setManterMesmoPrazoDivergente(false)
                }}
              />
            </TabsContent>
          </Tabs>
          {prazoDivergente && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs space-y-2">
              <p className="flex items-center gap-1 font-medium text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                Prazo médio das condições de pagamento ({comparacaoPrazo.prazoCondicoes.toFixed(
                  1,
                )}{' '}
                dias) difere do prazo da tabela ({comparacaoPrazo.prazoTabela.toFixed(1)} dias).
              </p>
              <label className="flex items-center gap-2 text-amber-800">
                <input
                  type="checkbox"
                  checked={manterMesmoPrazoDivergente}
                  onChange={(e) => setManterMesmoPrazoDivergente(e.target.checked)}
                  className="accent-[#005B2E]"
                />
                Manter mesmo assim (o usuário decide)
              </label>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
