import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { MkExternalQuotationsPanel } from '@/components/trade-marketing/mk-eq-panel'

export function ScreenCotacoesExternas() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Cotações Externas
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Origem Única de Compras Mkt & Trade
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Central de cotações externas para fornecimento de brindes, materiais de PDV, mídias e
              serviços terceirizados de marketing com mapa comparativo de propostas e aprovação
              formal.
            </p>
          </div>
        </div>
      </div>

      {/* PAINEL COMPLETO DE COTAÇÕES */}
      <MkExternalQuotationsPanel />
    </div>
  )
}
