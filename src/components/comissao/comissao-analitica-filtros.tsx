import { useState } from 'react'
import {
  type FiltrosComissao,
  type MetodoApuracao,
  type RcaOption,
} from '@/services/comissao-analitica'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  RotateCcw,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FiltrosProps {
  filtros: FiltrosComissao
  rcas: RcaOption[]
  rcaSelecionado: RcaOption | null
  onFiltrosChange: (novos: FiltrosComissao) => void
  onRcaChange: (rca: RcaOption | null) => void
  onConsultar: () => void
  onLimpar: () => void
  onExportarExcel: () => void
  onExportarPdf: () => void
  onImprimir: () => void
  loading?: boolean
}

export function ComissaoAnaliticaFiltros({
  filtros,
  rcas,
  rcaSelecionado,
  onFiltrosChange,
  onRcaChange,
  onConsultar,
  onLimpar,
  onExportarExcel,
  onExportarPdf,
  onImprimir,
  loading = false,
}: FiltrosProps) {
  const [expandido, setExpandido] = useState(false)

  // Atalhos de período
  const aplicarAtalhoPeriodo = (atalho: 'este_mes' | 'mes_anterior' | 'ultimos_30') => {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = hoje.getMonth() // 0 a 11

    if (atalho === 'este_mes') {
      const primeiroDia = new Date(ano, mes, 1).toISOString().slice(0, 10)
      const ultimoDia = new Date(ano, mes + 1, 0).toISOString().slice(0, 10)
      onFiltrosChange({ ...filtros, dataInicio: primeiroDia, dataFim: ultimoDia })
    } else if (atalho === 'mes_anterior') {
      const primeiroDia = new Date(ano, mes - 1, 1).toISOString().slice(0, 10)
      const ultimoDia = new Date(ano, mes, 0).toISOString().slice(0, 10)
      onFiltrosChange({ ...filtros, dataInicio: primeiroDia, dataFim: ultimoDia })
    } else if (atalho === 'ultimos_30') {
      const passados = new Date(hoje)
      passados.setDate(hoje.getDate() - 30)
      onFiltrosChange({
        ...filtros,
        dataInicio: passados.toISOString().slice(0, 10),
        dataFim: hoje.toISOString().slice(0, 10),
      })
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs p-4 sm:p-5 space-y-4">
      {/* Linha Principal de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
        {/* Método de Apuração (Exatamente as duas opções do print: Adiantamento e Apuração Mensal) */}
        <div className="lg:col-span-3 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            Método de apuração: <span className="text-red-500">*</span>
          </Label>
          <Select
            value={filtros.metodoApuracao}
            onValueChange={(val: MetodoApuracao) =>
              onFiltrosChange({ ...filtros, metodoApuracao: val })
            }
          >
            <SelectTrigger className="h-9 font-medium text-xs bg-background border-input focus:ring-1 focus:ring-[#002817]">
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Adiantamento">Adiantamento</SelectItem>
              <SelectItem value="Apuração Mensal">Apuração mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RCA: Código + Nome com listagem pesquisável */}
        <div className="lg:col-span-4 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            RCA: <span className="text-red-500">*</span>
          </Label>
          <Select
            value={rcaSelecionado?.code || ''}
            onValueChange={(val) => {
              const r = rcas.find((item) => item.code === val) || null
              onRcaChange(r)
            }}
          >
            <SelectTrigger className="h-9 font-medium text-xs bg-background border-input focus:ring-1 focus:ring-[#002817] truncate">
              <SelectValue placeholder="Selecione o RCA">
                {rcaSelecionado
                  ? `${rcaSelecionado.code} — ${rcaSelecionado.name}`
                  : 'Selecione o Representante'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {rcas.map((r) => (
                <SelectItem key={r.code} value={r.code} className="text-xs font-medium">
                  <span className="font-mono font-bold text-[#002817] dark:text-[#E4C46A]">
                    {r.code}
                  </span>{' '}
                  — {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Inicial */}
        <div className="lg:col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            Da data <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })}
            className="h-9 text-xs font-medium bg-background"
          />
        </div>

        {/* Data Final */}
        <div className="lg:col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            Até a data <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })}
            className="h-9 text-xs font-medium bg-background"
          />
        </div>

        {/* Botão de Consultar */}
        <div className="lg:col-span-1 flex items-end">
          <Button
            type="button"
            onClick={onConsultar}
            disabled={loading}
            className="w-full h-9 bg-[#002817] hover:bg-[#00381C] text-white font-semibold text-xs shadow-xs"
          >
            <Search className="w-3.5 h-3.5 mr-1" />
            Consultar
          </Button>
        </div>
      </div>

      {/* Atalhos Rápidos e Ações de Exportação */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-border/60 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-semibold mr-1">Atalhos:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => aplicarAtalhoPeriodo('este_mes')}
            className="h-7 text-[11px] px-2.5 rounded-md hover:bg-muted"
          >
            Este mês
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => aplicarAtalhoPeriodo('mes_anterior')}
            className="h-7 text-[11px] px-2.5 rounded-md hover:bg-muted"
          >
            Mês anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => aplicarAtalhoPeriodo('ultimos_30')}
            className="h-7 text-[11px] px-2.5 rounded-md hover:bg-muted"
          >
            Últimos 30 dias
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpandido(!expandido)}
            className="h-7 text-[11px] px-2 text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/10 ml-1 font-semibold"
          >
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            {expandido ? 'Ocultar Filtros Avançados' : 'Filtros Avançados'}
            {expandido ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLimpar}
            className="h-7 text-[11px] px-2.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Limpar Filtros
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2.5 border-[#002817]/30 text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/10 font-semibold"
              >
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onExportarExcel} className="cursor-pointer text-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportarPdf} className="cursor-pointer text-xs">
                <FileText className="w-3.5 h-3.5 mr-2 text-red-600" />
                PDF Executivo (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onImprimir}
            className="h-7 text-[11px] px-2.5 border-border hover:bg-muted font-medium"
          >
            <Printer className="w-3 h-3 mr-1" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Área Recolhível de Filtros Avançados */}
      {expandido && (
        <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Cliente / Razão Social</Label>
            <Input
              placeholder="Pesquisar cliente..."
              value={filtros.cliente || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, cliente: e.target.value })}
              className="h-8 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Nº da Nota Fiscal</Label>
            <Input
              placeholder="Ex: 173299"
              value={filtros.numeroNF || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, numeroNF: e.target.value })}
              className="h-8 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Nº do Pedido</Label>
            <Input
              placeholder="Ex: 1226456"
              value={filtros.numeroPedido || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, numeroPedido: e.target.value })}
              className="h-8 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Nº do Título</Label>
            <Input
              placeholder="Ex: 00173299/3"
              value={filtros.numeroTitulo || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, numeroTitulo: e.target.value })}
              className="h-8 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Tipo de Operação</Label>
            <Select
              value={filtros.tipoOperacao || 'todos'}
              onValueChange={(val) => onFiltrosChange({ ...filtros, tipoOperacao: val })}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Todas as operações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as operações</SelectItem>
                <SelectItem value="Venda">Vendas</SelectItem>
                <SelectItem value="Devolução">Devoluções / Estornos</SelectItem>
                <SelectItem value="Ajuste">Ajustes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Situação do Título</Label>
            <Select
              value={filtros.situacaoComissao || 'todas'}
              onValueChange={(val) => onFiltrosChange({ ...filtros, situacaoComissao: val })}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Todas as situações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as situações</SelectItem>
                <SelectItem value="Pago">Pago / Liquidado</SelectItem>
                <SelectItem value="Em Aberto">Em Aberto</SelectItem>
                <SelectItem value="Parcial">Parcialmente Recebido</SelectItem>
                <SelectItem value="Estornado">Estornado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Empresa / Filial</Label>
            <Input
              placeholder="Todas as filiais"
              value={filtros.filial || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, filial: e.target.value })}
              className="h-8 text-xs bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Equipe Comercial</Label>
            <Input
              placeholder="Todas as equipes"
              value={filtros.equipe || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, equipe: e.target.value })}
              className="h-8 text-xs bg-background"
            />
          </div>
        </div>
      )}
    </div>
  )
}
