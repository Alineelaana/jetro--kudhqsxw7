import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { FileDown, Printer, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import {
  STATUS_LABELS,
  PRIORIDADE_LABELS,
  type Chamado,
  type ChamadoStatus,
  type ChamadoPrioridade,
  type ChamadoSlaConfig,
  chamadosService,
} from '@/services/chamados'

interface RelatorioChamadosModalProps {
  aberto: boolean
  onClose: () => void
  chamadosFiltrados: Chamado[]
  slaConfigs: ChamadoSlaConfig[]
  periodoLabel: string
  filtrosAtivosDescricao: string[]
}

export default function RelatorioChamadosModal({
  aberto,
  onClose,
  chamadosFiltrados,
  slaConfigs,
  periodoLabel,
  filtrosAtivosDescricao,
}: RelatorioChamadosModalProps) {
  // Opções de seções
  const [incluirResumoExecutivo, setIncluirResumoExecutivo] = useState(true)
  const [incluirProdutividade, setIncluirProdutividade] = useState(true)
  const [incluirDetalhamento, setIncluirDetalhamento] = useState(true)
  const [incluirObservacoesGerenciais, setIncluirObservacoesGerenciais] = useState(true)

  // Estatísticas consolidadas calculadas estritamente com base nos chamados recebidos
  const dados = useMemo(() => {
    const total = chamadosFiltrados.length
    const novos = chamadosFiltrados.filter((c) => c.status === 'novo').length
    const andamento = chamadosFiltrados.filter((c) => c.status === 'andamento').length
    const aprovacao = chamadosFiltrados.filter((c) => c.status === 'aprovacao').length
    const finalizados = chamadosFiltrados.filter((c) => c.status === 'finalizado').length
    const cancelados = chamadosFiltrados.filter((c) => c.status === 'cancelado').length

    let atrasados = 0
    let resolvidosNoPrazo = 0
    let tempoResolucaoTotalHoras = 0
    let chamadosComTempoResolucao = 0

    // Por profissional
    const profMap: Record<
      string,
      {
        nome: string
        total: number
        andamento: number
        pendentes: number
        finalizados: number
        atrasados: number
        dentroPrazo: number
        tempoTotalHoras: number
      }
    > = {}

    // Por solicitante
    const solMap: Record<
      string,
      {
        nome: string
        setor: string
        total: number
        andamento: number
        pendentes: number
        finalizados: number
      }
    > = {}

    // Por setor solicitante vs responsável
    const setorRespMap: Record<string, number> = {}
    const setorSolMap: Record<string, number> = {}

    // Por prioridade
    const prioridadeMap: Record<string, number> = {
      baixa: 0,
      normal: 0,
      alta: 0,
      urgente: 0,
    }

    chamadosFiltrados.forEach((c) => {
      const situacao = chamadosService.calcularSituacaoSla(c, slaConfigs)
      if (situacao.estaAtrasado) atrasados++
      if (situacao.resolvidoNoPrazo) resolvidosNoPrazo++

      // Tempo de resolução
      if (c.status === 'finalizado') {
        const dtInicio = new Date(c.created).getTime()
        const dtFim = c.data_conclusao
          ? new Date(c.data_conclusao).getTime()
          : new Date(c.updated).getTime()
        const diffHoras = Math.max((dtFim - dtInicio) / (3600 * 1000), 0.1)
        tempoResolucaoTotalHoras += diffHoras
        chamadosComTempoResolucao++
      }

      // Prioridade
      const prio = c.prioridade || 'normal'
      prioridadeMap[prio] = (prioridadeMap[prio] || 0) + 1

      // Setor responsável
      const setorNome = c.expand?.setor_responsavel?.name || 'Não atribuído'
      setorRespMap[setorNome] = (setorRespMap[setorNome] || 0) + 1

      // Setor solicitante
      const setorSol = c.expand?.solicitante?.departamento || 'Geral'
      setorSolMap[setorSol] = (setorSolMap[setorSol] || 0) + 1

      // Profissional
      const profId = c.profissional_responsavel || 'sem_atribuicao'
      const profNome = c.expand?.profissional_responsavel?.name || 'Não atribuído'
      if (!profMap[profId]) {
        profMap[profId] = {
          nome: profNome,
          total: 0,
          andamento: 0,
          pendentes: 0,
          finalizados: 0,
          atrasados: 0,
          dentroPrazo: 0,
          tempoTotalHoras: 0,
        }
      }
      profMap[profId].total++
      if (c.status === 'andamento') profMap[profId].andamento++
      if (c.status === 'novo' || c.status === 'aprovacao') profMap[profId].pendentes++
      if (c.status === 'finalizado') {
        profMap[profId].finalizados++
        const tIni = new Date(c.created).getTime()
        const tFim = c.data_conclusao
          ? new Date(c.data_conclusao).getTime()
          : new Date(c.updated).getTime()
        profMap[profId].tempoTotalHoras += Math.max((tFim - tIni) / (3600 * 1000), 0.1)
      }
      if (situacao.estaAtrasado) profMap[profId].atrasados++
      else profMap[profId].dentroPrazo++

      // Solicitante
      const solId = c.solicitante || 'sem_solicitante'
      const solNome = c.expand?.solicitante?.name || 'Desconhecido'
      if (!solMap[solId]) {
        solMap[solId] = {
          nome: solNome,
          setor: setorSol,
          total: 0,
          andamento: 0,
          pendentes: 0,
          finalizados: 0,
        }
      }
      solMap[solId].total++
      if (c.status === 'andamento') solMap[solId].andamento++
      if (c.status === 'novo' || c.status === 'aprovacao') solMap[solId].pendentes++
      if (c.status === 'finalizado') solMap[solId].finalizados++
    })

    const percentualSla = total > 0 ? Math.round(((total - atrasados) / total) * 100) : 100
    const taxaResolucao = total > 0 ? Math.round((finalizados / total) * 100) : 0
    const tempoMedioResolucaoHoras =
      chamadosComTempoResolucao > 0
        ? (tempoResolucaoTotalHoras / chamadosComTempoResolucao).toFixed(1)
        : '0.0'

    const listaProfissionais = Object.values(profMap).sort((a, b) => b.total - a.total)
    const listaSolicitantes = Object.values(solMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Observações gerenciais calculadas estritamente com base nos dados
    const setorMaiorVolume = Object.entries(setorRespMap).sort((a, b) => b[1] - a[1])[0]
    const profMaiorVolume = listaProfissionais[0]

    return {
      total,
      novos,
      andamento,
      aprovacao,
      finalizados,
      cancelados,
      atrasados,
      resolvidosNoPrazo,
      percentualSla,
      taxaResolucao,
      tempoMedioResolucaoHoras,
      listaProfissionais,
      listaSolicitantes,
      setorRespMap,
      setorSolMap,
      prioridadeMap,
      setorMaiorVolume,
      profMaiorVolume,
    }
  }, [chamadosFiltrados, slaConfigs])

  // Abertura da janela de impressão corporativa formatada para 3 blocos de página
  const imprimirRelatorio = () => {
    const dataHoraEmissao = new Date().toLocaleString('pt-BR')

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Por favor, permita pop-ups para gerar o Relatório PDF do Jetro.')
      return
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Executivo de Chamados — Jetro ERP</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .page-container {
      page-break-after: always;
      min-height: 260mm;
      position: relative;
      padding-bottom: 25px;
    }
    .page-container:last-child {
      page-break-after: avoid;
    }
    .header-jetro {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #002817;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      background: #002817;
      color: #C9A227;
      font-weight: 900;
      font-size: 16px;
      letter-spacing: 1.5px;
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid #C9A227;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #002817;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 10px;
      color: #666;
      margin: 0;
    }
    .header-meta {
      text-align: right;
      font-size: 9.5px;
      color: #555;
    }
    .header-meta strong {
      color: #002817;
    }
    .page-title-badge {
      display: inline-block;
      background: #002817;
      color: #E4C46A;
      font-weight: 700;
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
    }
    .page-h2 {
      font-size: 15px;
      font-weight: 800;
      color: #002817;
      margin: 0 0 4px 0;
    }
    .page-desc {
      font-size: 10px;
      color: #666;
      margin: 0 0 12px 0;
    }
    .filter-banner {
      background: #f7f9f8;
      border: 1px solid #e2e8e5;
      border-left: 3px solid #002817;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 9.5px;
      color: #444;
      margin-bottom: 14px;
    }
    /* Grid de KPIs */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #e5e7eb;
      background: #ffffff;
      border-radius: 6px;
      padding: 8px 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .kpi-val {
      font-size: 18px;
      font-weight: 800;
      color: #002817;
      margin-top: 2px;
    }
    .kpi-sub {
      font-size: 8.5px;
      color: #9ca3af;
      margin-top: 1px;
    }
    .border-gold { border-top: 3px solid #C9A227; }
    .border-green { border-top: 3px solid #005B2E; }
    .border-red { border-top: 3px solid #b91c1c; }
    .border-blue { border-top: 3px solid #2563eb; }

    /* Funil de status */
    .funnel-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr) 1fr;
      gap: 6px;
      margin-bottom: 14px;
    }
    .funnel-step {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 8px;
      text-align: center;
      position: relative;
    }
    .funnel-step.step-novo { border-left: 3px solid #3b82f6; }
    .funnel-step.step-andamento { border-left: 3px solid #f59e0b; }
    .funnel-step.step-aprovacao { border-left: 3px solid #8b5cf6; }
    .funnel-step.step-finalizado { border-left: 3px solid #10b981; }
    .funnel-step.step-cancelado { border-left: 3px solid #9ca3af; background: #fafafa; }
    .funnel-val { font-size: 15px; font-weight: 800; color: #111827; }
    .funnel-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #4b5563; }

    /* Tabelas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      margin-bottom: 12px;
      font-size: 9.5px;
    }
    th {
      background: #002817;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 5px 8px;
      border: 1px solid #002817;
      font-size: 9px;
      letter-spacing: 0.3px;
    }
    th.text-center, td.text-center { text-align: center; }
    th.text-right, td.text-right { text-align: right; }
    td {
      padding: 5px 8px;
      border: 1px solid #e5e7eb;
      color: #374151;
    }
    tr:nth-child(even) td {
      background: #fcfcfc;
    }

    /* Leitura Gerencial */
    .observacoes-box {
      background: #f3f6f4;
      border: 1px solid #c9d8d0;
      border-left: 4px solid #005B2E;
      border-radius: 4px;
      padding: 10px 12px;
      margin-top: 14px;
    }
    .observacoes-title {
      font-size: 11px;
      font-weight: 800;
      color: #002817;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .observacoes-list {
      margin: 0;
      padding-left: 16px;
      font-size: 9.5px;
      color: #2b3a32;
    }
    .observacoes-list li {
      margin-bottom: 3px;
    }

    /* Rodapé */
    .footer-jetro {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 1px solid #d1d5db;
      padding-top: 4px;
      font-size: 8.5px;
      color: #71717a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge-tag {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .tag-dentro { background: #dcfce7; color: #15803d; }
    .tag-atrasado { background: #fee2e2; color: #b91c1c; }
    .tag-prox { background: #fef3c7; color: #b45309; }
  </style>
</head>
<body>

  <!-- ================= PÁGINA 1: RESUMO EXECUTIVO ================= -->
  ${
    incluirResumoExecutivo
      ? `
  <div class="page-container">
    <div class="header-jetro">
      <div class="brand">
        <div class="brand-logo">JETRO</div>
        <div>
          <h1 class="brand-title">Central de Chamados — ERP Jetro</h1>
          <p class="brand-sub">Sistema Integrado de Gestão Empresarial</p>
        </div>
      </div>
      <div class="header-meta">
        <div><strong>Período de Análise:</strong> ${periodoLabel}</div>
        <div><strong>Emissão:</strong> ${dataHoraEmissao}</div>
        <div><strong>Classificação:</strong> Confidencial / Gerencial</div>
      </div>
    </div>

    <div>
      <span class="page-title-badge">Página 1 • Relatório Gerencial</span>
      <h2 class="page-h2">Resumo Executivo de Demandas & Cumprimento de SLA</h2>
      <p class="page-desc">Consolidação global dos chamados no período, indicadores operacionais de SLA e funil de resolução.</p>
    </div>

    <div class="filter-banner">
      <strong>Filtros aplicados:</strong> ${filtrosAtivosDescricao.length > 0 ? filtrosAtivosDescricao.join(' | ') : 'Todos os registros do período sem restrições adicionais'}.
    </div>

    <!-- Indicadores Principais -->
    <div class="kpi-grid">
      <div class="kpi-card border-gold">
        <div class="kpi-label">Volume Total</div>
        <div class="kpi-val">${dados.total}</div>
        <div class="kpi-sub">Demandas no período</div>
      </div>
      <div class="kpi-card border-green">
        <div class="kpi-label">Índice SLA Cumprido</div>
        <div class="kpi-val">${dados.percentualSla}%</div>
        <div class="kpi-sub">${dados.total - dados.atrasados} de ${dados.total} dentro do prazo</div>
      </div>
      <div class="kpi-card border-blue">
        <div class="kpi-label">Taxa de Resolução</div>
        <div class="kpi-val">${dados.taxaResolucao}%</div>
        <div class="kpi-sub">${dados.finalizados} chamados concluídos</div>
      </div>
      <div class="kpi-card border-red">
        <div class="kpi-label">Tempo Médio Resolução</div>
        <div class="kpi-val">${dados.tempoMedioResolucaoHoras}h</div>
        <div class="kpi-sub">Média real apurada</div>
      </div>
    </div>

    <!-- Funil de Chamados -->
    <div style="margin-top: 10px;">
      <div style="font-size: 10px; font-weight: 700; color: #002817; margin-bottom: 4px; text-transform: uppercase;">
        Funil Operacional de Status
      </div>
      <div class="funnel-container">
        <div class="funnel-step step-novo">
          <div class="funnel-val">${dados.novos}</div>
          <div class="funnel-lbl">Novos (Triagem)</div>
        </div>
        <div class="funnel-step step-andamento">
          <div class="funnel-val">${dados.andamento}</div>
          <div class="funnel-lbl">Em Atendimento</div>
        </div>
        <div class="funnel-step step-aprovacao">
          <div class="funnel-val">${dados.aprovacao}</div>
          <div class="funnel-lbl">Aguardando Aprovação</div>
        </div>
        <div class="funnel-step step-finalizado">
          <div class="funnel-val">${dados.finalizados}</div>
          <div class="funnel-lbl">Finalizados</div>
        </div>
        <div class="funnel-step step-cancelado">
          <div class="funnel-val">${dados.cancelados}</div>
          <div class="funnel-lbl">Cancelados</div>
        </div>
      </div>
    </div>

    <!-- Distribuição por Setor Responsável vs Solicitante -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px;">
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #002817; margin-bottom: 2px;">
          Setores Mais Acionados (Responsáveis)
        </div>
        <table>
          <thead>
            <tr>
              <th>Setor Destino</th>
              <th class="text-right">Chamados</th>
              <th class="text-right">% Part.</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(dados.setorRespMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(
                ([nome, qtd]) => `
              <tr>
                <td><strong>${nome}</strong></td>
                <td class="text-right">${qtd}</td>
                <td class="text-right">${dados.total > 0 ? Math.round((qtd / dados.total) * 100) : 0}%</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div>
        <div style="font-size: 10px; font-weight: 700; color: #002817; margin-bottom: 2px;">
          Setores Solicitantes Mais Ativos
        </div>
        <table>
          <thead>
            <tr>
              <th>Setor Origem</th>
              <th class="text-right">Aberturas</th>
              <th class="text-right">% Part.</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(dados.setorSolMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(
                ([nome, qtd]) => `
              <tr>
                <td><strong>${nome}</strong></td>
                <td class="text-right">${qtd}</td>
                <td class="text-right">${dados.total > 0 ? Math.round((qtd / dados.total) * 100) : 0}%</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${
      incluirObservacoesGerenciais
        ? `
    <!-- Leitura Gerencial -->
    <div class="observacoes-box">
      <div class="observacoes-title">
        <span>Leitura Gerencial dos Indicadores Operacionais</span>
      </div>
      <ul class="observacoes-list">
        <li><strong>Cumprimento de SLA:</strong> A taxa de conformidade está em <strong>${dados.percentualSla}%</strong>, com <strong>${dados.atrasados}</strong> demanda(s) fora da meta temporal.</li>
        <li><strong>Concentração Setorial:</strong> O setor mais demandado é <strong>${dados.setorMaiorVolume ? dados.setorMaiorVolume[0] : 'Nenhum'}</strong> com <strong>${dados.setorMaiorVolume ? dados.setorMaiorVolume[1] : 0}</strong> chamados atribuídos.</li>
        <li><strong>Tempo Médio de Atendimento:</strong> O ciclo médio de encerramento das demandas apurado no banco real é de <strong>${dados.tempoMedioResolucaoHoras} horas</strong>.</li>
        <li><strong>Fila Ativa:</strong> Há atualmente <strong>${dados.novos + dados.andamento + dados.aprovacao}</strong> chamados pendentes de conclusão definitiva na operação.</li>
      </ul>
    </div>
    `
        : ''
    }

    <div class="footer-jetro">
      <span>Jetro ERP • Gestão Integrada de Processos e Chamados</span>
      <span>Página 1 de ${3}</span>
    </div>
  </div>
  `
      : ''
  }

  <!-- ================= PÁGINA 2: PRODUTIVIDADE E PARTICIPAÇÃO ================= -->
  ${
    incluirProdutividade
      ? `
  <div class="page-container">
    <div class="header-jetro">
      <div class="brand">
        <div class="brand-logo">JETRO</div>
        <div>
          <h1 class="brand-title">Central de Chamados — ERP Jetro</h1>
          <p class="brand-sub">Produtividade & Participação de Colaboradores</p>
        </div>
      </div>
      <div class="header-meta">
        <div><strong>Período:</strong> ${periodoLabel}</div>
        <div><strong>Emissão:</strong> ${dataHoraEmissao}</div>
      </div>
    </div>

    <div>
      <span class="page-title-badge">Página 2 • Painel Operacional</span>
      <h2 class="page-h2">Desempenho por Profissional & Maiores Solicitantes</h2>
      <p class="page-desc">Mapeamento de capacidade produtiva, resolução, aderência ao SLA e solicitações por usuário.</p>
    </div>

    <div style="margin-top: 6px;">
      <div style="font-size: 10px; font-weight: 700; color: #002817; margin-bottom: 2px;">
        1. Desempenho por Profissional Responsável
      </div>
      <table>
        <thead>
          <tr>
            <th>Profissional</th>
            <th class="text-center">Total</th>
            <th class="text-center">Em And.</th>
            <th class="text-center">Pend.</th>
            <th class="text-center">Concluídos</th>
            <th class="text-center">Atrasados</th>
            <th class="text-center">% Concl.</th>
            <th class="text-center">SLA Cumprido</th>
            <th class="text-right">Tempo Médio</th>
          </tr>
        </thead>
        <tbody>
          ${
            dados.listaProfissionais.length === 0
              ? '<tr><td colspan="9" class="text-center" style="padding: 12px; color: #999;">Nenhum profissional com chamados atribuídos no período.</td></tr>'
              : dados.listaProfissionais
                  .map((p) => {
                    const percConcl = p.total > 0 ? Math.round((p.finalizados / p.total) * 100) : 0
                    const percSla =
                      p.total > 0 ? Math.round(((p.total - p.atrasados) / p.total) * 100) : 100
                    const tMedio =
                      p.finalizados > 0 ? (p.tempoTotalHoras / p.finalizados).toFixed(1) + 'h' : '—'
                    return `
              <tr>
                <td><strong>${p.nome}</strong></td>
                <td class="text-center"><strong>${p.total}</strong></td>
                <td class="text-center">${p.andamento}</td>
                <td class="text-center">${p.pendentes}</td>
                <td class="text-center" style="color: #15803d; font-weight: 700;">${p.finalizados}</td>
                <td class="text-center" style="color: ${p.atrasados > 0 ? '#b91c1c' : '#555'}; font-weight: 700;">${p.atrasados}</td>
                <td class="text-center">${percConcl}%</td>
                <td class="text-center">${percSla}%</td>
                <td class="text-right">${tMedio}</td>
              </tr>
            `
                  })
                  .join('')
          }
        </tbody>
      </table>
    </div>

    <div style="margin-top: 14px;">
      <div style="font-size: 10px; font-weight: 700; color: #002817; margin-bottom: 2px;">
        2. Maiores Solicitantes de Demandas (Top 10)
      </div>
      <table>
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Departamento / Setor</th>
            <th class="text-center">Total Abertos</th>
            <th class="text-center">Em Andamento</th>
            <th class="text-center">Pendentes</th>
            <th class="text-center">Finalizados</th>
          </tr>
        </thead>
        <tbody>
          ${
            dados.listaSolicitantes.length === 0
              ? '<tr><td colspan="6" class="text-center" style="padding: 12px; color: #999;">Nenhum solicitante identificado no período.</td></tr>'
              : dados.listaSolicitantes
                  .map(
                    (s) => `
              <tr>
                <td><strong>${s.nome}</strong></td>
                <td>${s.setor}</td>
                <td class="text-center"><strong>${s.total}</strong></td>
                <td class="text-center">${s.andamento}</td>
                <td class="text-center">${s.pendentes}</td>
                <td class="text-center" style="color: #15803d; font-weight: 700;">${s.finalizados}</td>
              </tr>
            `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    </div>

    <div class="footer-jetro">
      <span>Jetro ERP • Gestão Integrada de Processos e Chamados</span>
      <span>Página 2 de ${3}</span>
    </div>
  </div>
  `
      : ''
  }

  <!-- ================= PÁGINA 3: DETALHAMENTO OPERACIONAL ================= -->
  ${
    incluirDetalhamento
      ? `
  <div class="page-container">
    <div class="header-jetro">
      <div class="brand">
        <div class="brand-logo">JETRO</div>
        <div>
          <h1 class="brand-title">Central de Chamados — ERP Jetro</h1>
          <p class="brand-sub">Detalhamento Operacional de Chamados</p>
        </div>
      </div>
      <div class="header-meta">
        <div><strong>Período:</strong> ${periodoLabel}</div>
        <div><strong>Emissão:</strong> ${dataHoraEmissao}</div>
      </div>
    </div>

    <div>
      <span class="page-title-badge">Página 3 • Auditoria & Rastreabilidade</span>
      <h2 class="page-h2">Relação Analítica de Chamados & Prazos de SLA</h2>
      <p class="page-desc">Listagem individualizada das ocorrências com status, prioridade, responsável e situação do SLA.</p>
    </div>

    <!-- Tabela Analítica -->
    <table>
      <thead>
        <tr>
          <th style="width: 75px;">Número</th>
          <th>Assunto</th>
          <th>Solicitante</th>
          <th>Setor Destino</th>
          <th>Responsável</th>
          <th class="text-center">Prioridade</th>
          <th class="text-center">Status</th>
          <th class="text-center">Abertura</th>
          <th class="text-center">Situação SLA</th>
        </tr>
      </thead>
      <tbody>
        ${
          chamadosFiltrados.length === 0
            ? '<tr><td colspan="9" class="text-center" style="padding: 16px; color: #999;">Nenhum chamado encontrado para os filtros selecionados.</td></tr>'
            : chamadosFiltrados
                .slice(0, 25)
                .map((c) => {
                  const situacao = chamadosService.calcularSituacaoSla(c, slaConfigs)
                  const prioInfo = PRIORIDADE_LABELS[c.prioridade]
                  const statusInfo = STATUS_LABELS[c.status]

                  let tagClasse = 'tag-dentro'
                  let tagTexto = 'No Prazo'
                  if (situacao.estaAtrasado) {
                    tagClasse = 'tag-atrasado'
                    tagTexto = 'Atrasado'
                  } else if (situacao.situacao === 'proximo_vencimento') {
                    tagClasse = 'tag-prox'
                    tagTexto = 'A Vencer'
                  }

                  const dtAbertura = new Date(c.created).toLocaleDateString('pt-BR')

                  return `
            <tr>
              <td><strong>${c.numero}</strong></td>
              <td style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${c.assunto}
              </td>
              <td>${c.expand?.solicitante?.name || 'Desconhecido'}</td>
              <td>${c.expand?.setor_responsavel?.name || '—'}</td>
              <td>${c.expand?.profissional_responsavel?.name || 'Não atribuído'}</td>
              <td class="text-center">
                <span style="font-weight: 700; font-size: 8px;">${prioInfo?.label || c.prioridade}</span>
              </td>
              <td class="text-center">
                <span style="font-weight: 700; font-size: 8px;">${statusInfo?.label || c.status}</span>
              </td>
              <td class="text-center">${dtAbertura}</td>
              <td class="text-center">
                <span class="badge-tag ${tagClasse}">${tagTexto}</span>
              </td>
            </tr>
          `
                })
                .join('')
        }
      </tbody>
    </table>

    ${
      chamadosFiltrados.length > 25
        ? `<div style="text-align: right; font-size: 8.5px; color: #666; margin-top: 4px;">Exibindo os primeiros 25 de ${chamadosFiltrados.length} registros para manter o padrão executivo de 3 páginas.</div>`
        : ''
    }

    <div class="footer-jetro">
      <span>Jetro ERP • Gestão Integrada de Processos e Chamados</span>
      <span>Página 3 de ${3}</span>
    </div>
  </div>
  `
      : ''
  }

</body>
</html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Disparar impressão após o carregamento da janela
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 400)
  }

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-[#002817] text-[#C9A227] rounded">
              <FileDown className="w-5 h-5" />
            </div>
            Gerar Relatório Executivo PDF
          </DialogTitle>
          <DialogDescription>
            Exporte o relatório gerencial completo com identidade corporativa Jetro em 3 blocos
            analíticos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Informações dos dados selecionados */}
          <div className="bg-muted/40 p-3 rounded-lg border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Período de referência:</span>
              <span className="font-semibold">{periodoLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registros selecionados:</span>
              <span className="font-semibold">{chamadosFiltrados.length} chamado(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SLA Médio no recorte:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {dados.percentualSla}% cumprido
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Estrutura do Relatório (3 Blocos)
            </Label>

            <div className="space-y-2">
              <div className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/50 border">
                <Checkbox
                  id="chk-p1"
                  checked={incluirResumoExecutivo}
                  onCheckedChange={(c) => setIncluirResumoExecutivo(!!c)}
                />
                <div className="grid gap-0.5 leading-none">
                  <label htmlFor="chk-p1" className="text-sm font-semibold cursor-pointer">
                    Página 1: Resumo Executivo
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Indicadores globais de SLA, taxa de resolução, tempo médio e funil de status.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/50 border">
                <Checkbox
                  id="chk-p2"
                  checked={incluirProdutividade}
                  onCheckedChange={(c) => setIncluirProdutividade(!!c)}
                />
                <div className="grid gap-0.5 leading-none">
                  <label htmlFor="chk-p2" className="text-sm font-semibold cursor-pointer">
                    Página 2: Produtividade e Participação
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Tabela por profissional responsável e ranking dos maiores setores/solicitantes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/50 border">
                <Checkbox
                  id="chk-p3"
                  checked={incluirDetalhamento}
                  onCheckedChange={(c) => setIncluirDetalhamento(!!c)}
                />
                <div className="grid gap-0.5 leading-none">
                  <label htmlFor="chk-p3" className="text-sm font-semibold cursor-pointer">
                    Página 3: Detalhamento Operacional
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Tabela detalhada de chamados recentes com situação de SLA e datas reais.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 pt-1 px-1">
                <Checkbox
                  id="chk-obs"
                  checked={incluirObservacoesGerenciais}
                  onCheckedChange={(c) => setIncluirObservacoesGerenciais(!!c)}
                />
                <label htmlFor="chk-obs" className="text-xs cursor-pointer text-muted-foreground">
                  Incluir observações gerenciais calculadas com base nas métricas apuradas
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button
            type="button"
            onClick={imprimirRelatorio}
            className="bg-[#002817] hover:bg-[#003820] text-[#E4C46A] border border-[#C9A227]/40 shadow-sm gap-2"
          >
            <Printer className="w-4 h-4" />
            Visualizar / Imprimir PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
