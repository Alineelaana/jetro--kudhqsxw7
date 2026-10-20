import { useState } from 'react'
import {
  Maximize2,
  X,
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Receipt,
  Truck,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ERPPreviewItem {
  id: string
  title: string
  module: string
  category:
    | 'Comercial'
    | 'Financeiro'
    | 'Fiscal'
    | 'WMS & Logística'
    | 'Inteligência'
    | 'Governança'
  summary: string
  previewType: 'dashboard' | 'pedidos' | 'financeiro' | 'fiscal' | 'wms' | 'jetro-online'
  details: string[]
}

export function SystemScreensGallery() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [activeItem, setActiveItem] = useState<ERPPreviewItem | null>(null)

  const items: ERPPreviewItem[] = [
    {
      id: 'dashboard-executivo',
      title: 'Dashboard Executivo & Cockpit de Gestão',
      module: 'Inteligência & BI',
      category: 'Inteligência',
      summary:
        'Visão panorâmica em tempo real de faturamento, liquidez, margem bruta, cumprimento de entregas e indicadores estratégicos por unidade de negócio.',
      previewType: 'dashboard',
      details: [
        'Indicadores de receita bruta, ticket médio e margem consolidada',
        'Filtros multidimensionais por período, filial e canal de venda',
        'Exportação rápida em formatos corporativos (Excel, CSV e PDF)',
        'Integração direta com as bases transacionais do ERP',
      ],
    },
    {
      id: 'consulta-pedidos',
      title: 'Gestão de Pedidos com Jetro Table',
      module: 'Gestão Comercial',
      category: 'Comercial',
      summary:
        'Tela estruturada para emissão, consulta e controle de pedidos com personalização de colunas, ordenação múltipla, reserva de estoque e alçadas de desconto.',
      previewType: 'pedidos',
      details: [
        'Grid avançado com ordenação, ocultação e fixação de colunas',
        'Status do pedido: Aberto, Aprovado, Faturado e Expedido',
        'Histórico detalhado de alterações por usuário responsável',
        'Vinculação direta com notas fiscais e centro de cobrança',
      ],
    },
    {
      id: 'centro-cobranca',
      title: 'Centro de Cobrança & Conciliação Bancária',
      module: 'Gestão Financeira',
      category: 'Financeiro',
      summary:
        'Acompanhamento de títulos a pagar e a receber com régua de ações, aging de inadimplência, conciliação por extrato bancário e liquidação múltipla.',
      previewType: 'financeiro',
      details: [
        'Aging de títulos (a vencer, 1-30 dias, 31-60 dias, 60+ dias)',
        'Registro de promessas de pagamento e renegociações',
        'Conciliação automática contra extratos bancários',
        'Controle de centros de custo e plano de contas contábil',
      ],
    },
    {
      id: 'painel-fiscal',
      title: 'Painel de Documentos Fiscais Eletrônicos',
      module: 'Gestão Fiscal',
      category: 'Fiscal',
      summary:
        'Emissão e monitoramento contínuo de NF-e, NFS-e, CT-e e MDF-e com consulta de status SEFAZ, cartas de correção e manifestação do destinatário.',
      previewType: 'fiscal',
      details: [
        'Consulta de lote SEFAZ em tempo real com protocolos de autorização',
        'Geração de DANFE e XML com armazenamento em nuvem segura',
        'Simulador da Reforma Tributária com análise comparativa (IBS/CBS)',
        'Gestão de cartas de correção eletrônicas (CC-e)',
      ],
    },
    {
      id: 'orquestracao-wms',
      title: 'Orquestração Logística & Expedição WMS',
      module: 'Operações & WMS',
      category: 'WMS & Logística',
      summary:
        'Controle completo de armazém: recebimento de cargas, conferência cega, formação de ondas de separação, montagem de romaneios e despacho para frotas.',
      previewType: 'wms',
      details: [
        'Conferência cega por código de barras com tolerância e divergências',
        'Geração de romaneios de entrega vinculados a notas e frotas',
        'Comprovante digital de entrega com geolocalização (POD)',
        'Gestão de motoristas, veículos e tabelas contratuais de frete',
      ],
    },
    {
      id: 'copiloto-jetro-online',
      title: 'Jetro On-line — Consulta em Linguagem Natural',
      module: 'Inteligência Artificial',
      category: 'Inteligência',
      summary:
        'Assistente interno copiloto operando sobre os dados do ERP: consulte indicadores, solicite gráficos analíticos e navegue por módulos conversando em português.',
      previewType: 'jetro-online',
      details: [
        'Interpretação contextual de perguntas operacionais e financeiras',
        'Renderização dinâmica de gráficos dentro do chat',
        'Acesso condicionado às permissões do usuário logado',
        'Atalhos diretos para tutoriais da Universidade Jetro',
      ],
    },
  ]

  const categories = [
    'Todos',
    'Comercial',
    'Financeiro',
    'Fiscal',
    'WMS & Logística',
    'Inteligência',
  ]

  const filteredItems =
    activeCategory === 'Todos' ? items : items.filter((it) => it.category === activeCategory)

  // Renderizador de mockup interativo com dados demonstrativos fictícios (segurança absoluta)
  const renderMockup = (type: ERPPreviewItem['previewType']) => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[10px] text-[#66736D] block uppercase font-medium">
                  Receita Bruta
                </span>
                <span className="text-sm sm:text-base font-semibold font-heading text-[#063D30]">
                  R$ 1.482.350
                </span>
                <span className="text-[10px] text-[#116B50] block mt-0.5 font-medium">
                  +12,4% vs mês anterior
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[10px] text-[#66736D] block uppercase font-medium">
                  Margem Operacional
                </span>
                <span className="text-sm sm:text-base font-semibold font-heading text-[#063D30]">
                  28,6%
                </span>
                <span className="text-[10px] text-[#C69B45] block mt-0.5 font-medium">
                  Meta atingida
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[10px] text-[#66736D] block uppercase font-medium">
                  Títulos em Aberto
                </span>
                <span className="text-sm sm:text-base font-semibold font-heading text-[#063D30]">
                  R$ 318.420
                </span>
                <span className="text-[10px] text-[#116B50] block mt-0.5 font-medium">
                  Inadimplência 1,8%
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[10px] text-[#66736D] block uppercase font-medium">
                  Entregas no Prazo
                </span>
                <span className="text-sm sm:text-base font-semibold font-heading text-[#063D30]">
                  97,8%
                </span>
                <span className="text-[10px] text-[#116B50] block mt-0.5 font-medium">
                  SLA cumprido
                </span>
              </div>
            </div>

            <div className="h-24 bg-white rounded-lg border border-[#E4EAE6] p-2.5 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs text-[#202B28]">
                <span className="font-semibold text-[11px]">Curva de Faturamento Semanal</span>
                <span className="text-[10px] text-[#66736D]">Dados demonstrativos</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-14 pt-1">
                {[45, 60, 52, 78, 65, 88, 92].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#063D30] hover:bg-[#116B50] transition-colors rounded-t-sm"
                      style={{ height: `${v}%` }}
                    />
                    <span className="text-[9px] text-[#66736D]">D{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'pedidos':
        return (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#202B28] pb-1 border-b border-[#E4EAE6]">
              <span className="font-semibold text-[11px]">Grid Jetro Table · Pedidos de Venda</span>
              <span className="text-[10px] text-[#C69B45] font-medium">
                Colunas personalizáveis
              </span>
            </div>
            <div className="overflow-x-auto text-xs bg-white rounded-lg border border-[#E4EAE6]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E4EAE6] bg-[#F8FAF9] text-[#66736D] text-[10px] uppercase font-semibold">
                    <th className="py-1.5 px-2">Pedido</th>
                    <th className="py-1.5 px-2">Cliente</th>
                    <th className="py-1.5 px-2">Status</th>
                    <th className="py-1.5 px-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4EAE6] text-[#202B28]">
                  <tr>
                    <td className="py-1.5 px-2 font-mono text-[#063D30] font-semibold text-[11px]">
                      PED-00482
                    </td>
                    <td className="py-1.5 px-2 text-[11px]">Comercial Alvorada Ltda</td>
                    <td className="py-1.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-[#063D30] border border-emerald-200 font-medium">
                        Faturado
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium text-[11px]">R$ 24.580,00</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-mono text-[#063D30] font-semibold text-[11px]">
                      PED-00483
                    </td>
                    <td className="py-1.5 px-2 text-[11px]">Distribuidora Serra Azul</td>
                    <td className="py-1.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                        Em Separação
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium text-[11px]">R$ 18.210,00</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-mono text-[#063D30] font-semibold text-[11px]">
                      PED-00484
                    </td>
                    <td className="py-1.5 px-2 text-[11px]">Supermercado Horizonte</td>
                    <td className="py-1.5 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                        Aguard. Aprovação
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium text-[11px]">R$ 41.900,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'financeiro':
        return (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[9px] text-[#66736D] block uppercase font-medium">
                  A Receber Hoje
                </span>
                <span className="text-xs sm:text-sm font-semibold font-heading text-[#116B50]">
                  R$ 54.200
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[9px] text-[#66736D] block uppercase font-medium">
                  A Pagar Hoje
                </span>
                <span className="text-xs sm:text-sm font-semibold font-heading text-amber-700">
                  R$ 38.150
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[9px] text-[#66736D] block uppercase font-medium">
                  Saldo Projetado
                </span>
                <span className="text-xs sm:text-sm font-semibold font-heading text-[#063D30]">
                  + R$ 16.050
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-[#E4EAE6] text-xs space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[#202B28]">
                <span className="font-semibold text-[11px]">
                  Conciliação Bancária Itaú (Conta 2480-1)
                </span>
                <span className="text-[10px] text-[#116B50] font-medium">100% Conciliado</span>
              </div>
              <div className="text-[11px] text-[#66736D]">
                Último lote importado por OFX com 42 transações liquidadas sem divergências.
              </div>
            </div>
          </div>
        )

      case 'fiscal':
        return (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#202B28] pb-1 border-b border-[#E4EAE6]">
              <span className="font-semibold text-[11px]">Painel NF-e · Status SEFAZ</span>
              <span className="flex items-center gap-1 text-[10px] text-[#116B50] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#116B50] inline-block" />
                SEFAZ Operacional
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white rounded-lg flex justify-between items-center border border-[#E4EAE6] text-left">
                <div>
                  <span className="font-mono text-[#063D30] font-semibold text-[11px]">
                    NF-e 001.942 · Série 1
                  </span>
                  <span className="text-[10px] text-[#66736D] block">
                    Chave: 3226 0812 3456 7890 0001
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-[#063D30] border border-emerald-200 font-medium">
                  Autorizada
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg flex justify-between items-center border border-[#E4EAE6] text-left">
                <div>
                  <span className="font-mono text-[#063D30] font-semibold text-[11px]">
                    MDF-e 000.318 · Série 1
                  </span>
                  <span className="text-[10px] text-[#66736D] block">
                    Manifesto Eletrônico de Carga
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-[#063D30] border border-emerald-200 font-medium">
                  Encerrado
                </span>
              </div>
            </div>
          </div>
        )

      case 'wms':
        return (
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[9px] text-[#66736D] block uppercase font-medium">
                  Doca 01
                </span>
                <span className="font-semibold font-heading text-[#063D30] text-xs sm:text-sm">
                  Recebimento
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[9px] text-[#66736D] block uppercase font-medium">
                  Ondas Ativas
                </span>
                <span className="font-semibold font-heading text-[#C69B45] text-xs sm:text-sm">
                  4 em Separação
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#E4EAE6]">
                <span className="text-[9px] text-[#66736D] block uppercase font-medium">
                  Expedição
                </span>
                <span className="font-semibold font-heading text-[#116B50] text-xs sm:text-sm">
                  3 Romaneios
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-[#E4EAE6] text-xs text-[#202B28] space-y-1 text-left">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[11px]">Romaneio ROM-2026-089</span>
                <span className="text-[10px] text-[#116B50] font-mono font-medium">
                  14 Entregas
                </span>
              </div>
              <div className="text-[11px] text-[#66736D]">
                Rota Grande Vitória · Veículo Placa ABC-4E21 · Motorista alocado com POD mobile
                ativo.
              </div>
            </div>
          </div>
        )

      case 'jetro-online':
        return (
          <div className="space-y-2 text-xs text-left">
            <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#E4EAE6] text-[#202B28]">
              <span className="text-[10px] font-semibold text-[#C69B45] uppercase block mb-1">
                Pergunta do Usuário
              </span>
              &ldquo;Jetro, qual o faturamento acumulado do canal Atacado neste mês e a margem
              média?&rdquo;
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E4EAE6] text-[#202B28] space-y-1">
              <span className="text-[10px] font-semibold text-[#116B50] uppercase block">
                Resposta do Jetro On-line
              </span>
              <p className="text-[11px] leading-relaxed text-[#202B28]">
                No canal <strong>Atacado</strong>, o faturamento acumulado é de{' '}
                <strong>R$ 842.190,00</strong> com margem bruta média de <strong>29,4%</strong>. Os
                3 produtos mais representativos são Linha A (38%), Linha B (24%) e Linha C (15%).
              </p>
              <div className="pt-1 text-[10px] text-[#66736D] border-t border-[#E4EAE6] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#C69B45]" />
                Resposta baseada nas coleções `sales_orders` e `products` em tempo real.
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <section
      id="telas"
      className="py-20 sm:py-28 bg-[#F8FAF9] text-[#202B28] border-b border-[#E4EAE6]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            Galeria do Sistema Real
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
            Conheça o Jetro <span className="text-[#116B50]">por dentro.</span>
          </h2>
          <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
            Navegue pelas interfaces operacionais reais do ERP. Telas organizadas, dados
            estruturados e fluxos projetados para dar produtividade à equipe do primeiro ao último
            clique.
          </p>

          {/* Filtros de Categoria */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#063D30] text-white shadow-xs font-medium'
                    : 'bg-white text-[#66736D] hover:text-[#063D30] hover:bg-[#F1F4F2] border border-[#E4EAE6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Telas / Interfaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md text-left"
            >
              {/* Moldura da Janela do ERP */}
              <div className="border-b border-[#E4EAE6] bg-[#F8FAF9] px-3.5 py-2.5 flex items-center justify-between text-xs text-[#66736D]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-[10px] text-[#202B28]/80 font-medium truncate max-w-[170px]">
                    {item.module}
                  </span>
                </div>
                <button
                  onClick={() => setActiveItem(item)}
                  className="text-[#66736D] hover:text-[#063D30] transition-colors p-1 cursor-pointer"
                  title="Expandir detalhes da tela"
                  aria-label="Expandir detalhes da tela"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preview Interativo Demonstrativo */}
              <div className="p-4 bg-[#F8FAF9]/50 min-h-[190px] flex flex-col justify-center">
                {renderMockup(item.previewType)}
              </div>

              {/* Informações Comerciais */}
              <div className="p-5 sm:p-6 border-t border-[#E4EAE6] space-y-3 bg-white flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C69B45]">
                    {item.category}
                  </span>
                  <h3 className="text-base font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#66736D] leading-relaxed font-normal">
                    {item.summary}
                  </p>
                </div>

                <Button
                  onClick={() => setActiveItem(item)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-[#E4EAE6] hover:border-[#063D30]/40 text-[#063D30] hover:text-[#063D30] bg-white hover:bg-[#F8FAF9] text-xs font-semibold cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-[#116B50]" />
                  Ver detalhes da interface
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox com Detalhes da Tela */}
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B28]/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-[#E4EAE6] shadow-xl p-6 sm:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b border-[#E4EAE6] pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
                    {activeItem.module} · {activeItem.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold font-heading text-[#063D30] mt-1">
                    {activeItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-lg bg-[#F8FAF9] text-[#66736D] hover:text-[#202B28] border border-[#E4EAE6] cursor-pointer"
                  aria-label="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pré-visualização da Interface */}
              <div className="rounded-xl border border-[#E4EAE6] bg-[#F8FAF9] p-4 sm:p-5">
                <div className="flex items-center justify-between text-xs text-[#66736D] mb-3 pb-2 border-b border-[#E4EAE6] font-mono">
                  <span>Demonstração com dados estruturados protegidos</span>
                  <span className="text-[#116B50] font-sans text-[11px] font-semibold">
                    ✓ Ambiente Homologado
                  </span>
                </div>
                {renderMockup(activeItem.previewType)}
              </div>

              {/* Explicação Técnica e Funcional */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold font-heading text-[#063D30] uppercase tracking-wider">
                  Recursos em Destaque Nesta Tela
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeItem.details.map((d, i) => (
                    <li key={i} className="text-xs text-[#202B28]/80 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#116B50] shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[#E4EAE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736D]">
                <span>Quer ver essa tela em operação com sua equipe?</span>
                <Button
                  onClick={() => {
                    setActiveItem(null)
                    const el = document.getElementById('contato')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="w-full sm:w-auto bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  Solicitar Demonstração Guiada
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Nota explicativa de segurança */}
        <div className="p-4 rounded-xl bg-white border border-[#E4EAE6] text-center max-w-3xl mx-auto shadow-2xs">
          <p className="text-xs text-[#66736D] leading-relaxed">
            <strong className="text-[#202B28] font-semibold">Privacidade assegurada:</strong> todas
            as demonstrações visuais utilizam dados fictícios homologados para conformidade com a
            LGPD e sigilo corporativo. Nenhum dado de clientes em produção é exposto publicamente.
          </p>
        </div>
      </div>
    </section>
  )
}
