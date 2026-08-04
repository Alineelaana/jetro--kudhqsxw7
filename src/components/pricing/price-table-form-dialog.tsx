import { useState, useEffect } from 'react'
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
      })
      setItems(parseItems(table?.items))
      setRules(parseRules(table?.rules))
      setActiveTab('general')
    }
  }, [open, table])

  const setField = (field: keyof PriceTableFormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.table_name.trim()) {
      toast({ title: 'Informe o nome da tabela', variant: 'destructive' })
      setActiveTab('general')
      return
    }
    setSaving(true)
    try {
      const belowMin = items.some((it) => {
        const min = parseFloat(String(it.min_price || '0').replace(',', '.')) || 0
        const price = parseFloat(String(it.new_price || '0').replace(',', '.')) || 0
        return min > 0 && price < min
      })
      const finalStatus = belowMin && form.status === 'ativa' ? 'aguardando_aprovacao' : form.status
      const data: Record<string, unknown> = {
        ...form,
        prioridade: parseInt(form.prioridade, 10) || 0,
        items,
        rules,
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
              <TabsTrigger value="items">
                Produtos e Serviços{items.length > 0 ? ` (${items.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="rules">Regras de Aplicação</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
              <PriceTableGeneralTab form={form} setField={setField} />
            </TabsContent>
            <TabsContent value="items" className="mt-4">
              <PriceTableItemsTab items={items} setItems={setItems} canViewCosts={canViewCosts} />
            </TabsContent>
            <TabsContent value="rules" className="mt-4">
              <PriceTableRulesTab rules={rules} setRules={setRules} />
            </TabsContent>
          </Tabs>
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
