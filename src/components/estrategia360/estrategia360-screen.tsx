// Painel principal da tela "Visão estratégica em 360°" — filtros globais + 10 abas.
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { OrigemSelector } from './origem-selector'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pb } from '@/lib/pocketbase/client'
import { useFlashVendas } from './index'
import { FlashVendasTab } from './flash-vendas'
import { FaturamentoTab, MarcasTab, ObjetivoTab } from './objetivo-faturamento-marcas'
import { EstoqueTab, FluxoCaixaTab, ProdutosTab } from './produtos-estoque-fluxo'
import { ClientesTab, FinanceiroTab, FornecedoresTab } from './financeiro-clientes-fornecedores'
import { TAB_DEFS, type EmpresaOption, type GlobalFilters, type TabId } from './types'

const MESES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateBR(iso: string) {
  return iso.split('-').reverse().join('/')
}

export function Estrategia360Screen() {
  const [applied, setApplied] = useState<GlobalFilters>(() => {
    const now = new Date()
    return {
      origens: [],
      marca: 'TODAS',
      diaReferencia: hojeISO(),
      mesAnoReferencia: `${MESES[now.getMonth()]}/${now.getFullYear()}`,
    }
  })
  // Rascunho de filtros: só entra em vigor ao clicar em "Processar".
  const [draft, setDraft] = useState<GlobalFilters>(applied)
  const [activeTab, setActiveTab] = useState<TabId>('flash-vendas')

  const { data: empresasOptions = [] } = useQuery({
    queryKey: ['estrategia360', 'empresas'],
    queryFn: async (): Promise<EmpresaOption[]> => {
      const res = await pb.collection('empresas').getList(1, 200, { sort: 'nome' })
      return res.items.map((e: any) => ({
        value: String(e.id),
        label: String(e.nome_exibicao ?? e.razao_social ?? e.nome),
      }))
    },
  })

  const draftInvalid =
    draft.diaReferencia > hojeISO() ||
    draft.diaReferencia.slice(0, 7) !==
      `${draft.mesAnoReferencia.split('/')[1]}-${draft.mesAnoReferencia.split('/')[0]}`

  const handleProcessar = () => {
    if (draftInvalid) return
    setApplied(draft)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Visão estratégica em 360°</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Origem</label>
              <OrigemSelector
                selected={draft.origens}
                onChange={(vals) => setDraft((d) => ({ ...d, origens: vals }))}
                options={empresasOptions}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Marca</label>
              <Input
                value={draft.marca}
                onChange={(e) => setDraft((d) => ({ ...d, marca: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Dia Referência
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateBR(draft.diaReferencia)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(draft.diaReferencia + 'T00:00:00')}
                    onSelect={(d) =>
                      d &&
                      setDraft((prev) => ({ ...prev, diaReferencia: d.toISOString().slice(0, 10) }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Mês/Ano Referência
              </label>
              <Input
                placeholder="mm/aaaa"
                value={draft.mesAnoReferencia}
                onChange={(e) => setDraft((d) => ({ ...d, mesAnoReferencia: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleProcessar} disabled={draftInvalid} className="w-full">
                <Play className="mr-2 h-4 w-4" /> Processar
              </Button>
            </div>
          </div>
          {draftInvalid && (
            <p className="text-xs text-red-600">
              O Dia Referência deve estar dentro do Mês/Ano Referência e não pode ser futuro.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList className="flex flex-wrap">
          {TAB_DEFS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="flash-vendas">
          <FlashVendasTab filters={applied} />
        </TabsContent>
        <TabsContent value="objetivo">
          <ObjetivoTab filters={applied} />
        </TabsContent>
        <TabsContent value="faturamento">
          <FaturamentoTab filters={applied} />
        </TabsContent>
        <TabsContent value="marcas">
          <MarcasTab filters={applied} />
        </TabsContent>
        <TabsContent value="produtos">
          <ProdutosTab filters={applied} />
        </TabsContent>
        <TabsContent value="estoque">
          <EstoqueTab filters={applied} />
        </TabsContent>
        <TabsContent value="financeiro">
          <FinanceiroTab filters={applied} />
        </TabsContent>
        <TabsContent value="fluxo-caixa">
          <FluxoCaixaTab filters={applied} />
        </TabsContent>
        <TabsContent value="clientes">
          <ClientesTab filters={applied} />
        </TabsContent>
        <TabsContent value="fornecedores">
          <FornecedoresTab filters={applied} />
        </TabsContent>
      </Tabs>

      <p className={cn('text-xs text-muted-foreground')}>
        Mudanças nos filtros entram em vigor ao clicar em &quot;Processar&quot; — cada aba recalcula
        sozinha, sem botão de atualização.
      </p>
    </div>
  )
}
