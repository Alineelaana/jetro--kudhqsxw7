import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { AiAssistant } from '@/components/ai-module/ai-assistant'
import { AiDashboard } from '@/components/ai-module/ai-dashboard'

export function ScreenAssistente() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Assistente e métricas atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO PADRÃO MULTITENANT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Assistente de IA
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Artificial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Assistente conversacional inteligente com suporte a consultas de vendas, estoque,
              finanças e resumo operacional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* DASHBOARD RESUMIDO DE MÉTRICAS */}
      <AiDashboard key={`stats-${refreshKey}`} />

      {/* CHAT DO ASSISTENTE */}
      <AiAssistant key={`assistant-${refreshKey}`} />
    </div>
  )
}
