import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsProvider } from '@/hooks/use-settings'
import { SystemParamsProvider } from '@/hooks/use-system-params'
import { AuthProvider } from '@/hooks/use-auth'
import { AuthorizationProvider } from '@/hooks/use-authorization'
import { ClientAuthProvider } from '@/hooks/use-client-auth'
import { CmsContentProvider } from '@/hooks/use-cms-content'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import AdminRegister from './pages/AdminRegister'
import AdminPasswordRecovery from './pages/AdminPasswordRecovery'

import ClientLogin from './pages/ClientLogin'
import ClientRegister from './pages/ClientRegister'
import PasswordRecovery from './pages/PasswordRecovery'
import ClientArea from './pages/ClientArea'
import ClientTracking from './pages/ClientTracking'
import ClientPasswordReset from './pages/ClientPasswordReset'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade'
import PoliticaComercial from './pages/PoliticaComercial'
import TermosDeUso from './pages/TermosDeUso'
import PoliticaCookies from './pages/PoliticaCookies'
import Products from './pages/Products'
import Cadastros from './pages/Cadastros'
import PriceTablesPage from './pages/PriceTablesPage'
import SalesDashboardPage from './pages/sales/SalesDashboardPage'
import SalesOrdersPage from './pages/sales/SalesOrdersPage'
import InvoicingPage from './pages/sales/InvoicingPage'
import NfePage from './pages/sales/NfePage'
import NfcePage from './pages/sales/NfcePage'
import ContractsPage from './pages/sales/ContractsPage'
import SalesReturnsPage from './pages/sales/SalesReturnsPage'
import SalesHistoryPage from './pages/sales/SalesHistoryPage'
import StockPage from './pages/StockPage'
import WmsScreen from './pages/WmsScreen'
import Layout from './components/Layout'
import Logistics from './pages/Logistics'
import Financial from './pages/Financial'
import RH from './pages/RH'
import Conformidade from './pages/Conformidade'
import Fiscal from './pages/Fiscal'
import CRM from './pages/CRM'
import { ConfiguracoesLayout } from '@/components/configuracoes/configuracoes-layout'
import { EmpresaScreen } from '@/components/configuracoes/empresa-screen'
import { ParametrosScreen } from '@/components/configuracoes/parametros-screen'
import { ConfigCrudScreen } from '@/components/configuracoes/config-crud-screen'
import { LogsScreen } from '@/components/configuracoes/logs-screen'
import { ApisScreen } from '@/components/configuracoes/apis-screen'
import { ImportExportScreen } from '@/components/configuracoes/import-export-screen'
import { PermissionMatrixScreen } from '@/components/configuracoes/permission-matrix-screen'
import { SegurancaScreen } from '@/components/configuracoes/seguranca-screen'
import Notifications from './pages/Notifications'
import { BackupScreen } from '@/components/configuracoes/backup-screen'
import AIModule from './pages/AIModule'
import Industry from './pages/Industry'
import Phase0Foundation from './pages/Phase0Foundation'
import VariableRemuneration from './pages/VariableRemuneration'
import { IndustryLayout } from '@/components/industry/industry-layout'
import { ProductionOrdersPanel } from '@/components/industry/production-orders-panel'
import { CapacityPanel } from '@/components/industry/capacity-panel'
import { PlanningPanel } from '@/components/industry/planning-panel'
import { ExecutionPanel } from '@/components/industry/execution-panel'
import { QualityExtendedPanel } from '@/components/industry/quality-extended-panel'
import { TraceabilityPanel } from '@/components/industry/traceability-panel'
import { KpisPanel } from '@/components/industry/kpis-panel'
import { MaintenancePanel } from '@/components/industry/maintenance-panel'
import {
  INTEGRATIONS_CONFIG,
  EMAIL_TEMPLATE_CONFIG,
  DOC_TEMPLATE_CONFIG,
  NOTIFICATION_CONFIG,
  NUMERATION_CONFIG,
} from '@/lib/configuracoes-config'

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <AuthorizationProvider>
            <SettingsProvider>
              <SystemParamsProvider>
                <ClientAuthProvider>
                  <CmsContentProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route element={<Layout />}>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin" element={<Admin />} />

                        <Route path="/admin/produtos" element={<Products />} />
                        <Route path="/admin/cadastros" element={<Cadastros />} />
                        <Route path="/admin/tabelas-precos" element={<PriceTablesPage />} />
                        <Route path="/admin/logistica" element={<Logistics screen="dashboard" />} />
                        <Route
                          path="/admin/logistica/rotas"
                          element={<Logistics screen="routes" />}
                        />
                        <Route
                          path="/admin/logistica/entregas"
                          element={<Logistics screen="deliveries" />}
                        />
                        <Route
                          path="/admin/logistica/veiculos"
                          element={<Logistics screen="vehicles" />}
                        />
                        <Route
                          path="/admin/logistica/motoristas"
                          element={<Logistics screen="drivers" />}
                        />
                        <Route
                          path="/admin/logistica/romaneios"
                          element={<Logistics screen="romaneios" />}
                        />
                        <Route
                          path="/admin/logistica/fretes"
                          element={<Logistics screen="freights" />}
                        />
                        <Route
                          path="/admin/logistica/tabelas-frete"
                          element={<Logistics screen="freight_tables" />}
                        />
                        <Route
                          path="/admin/logistica/rastreamento"
                          element={<Logistics screen="tracking" />}
                        />
                        <Route
                          path="/admin/logistica/ocorrencias"
                          element={<Logistics screen="occurrences" />}
                        />
                        <Route
                          path="/admin/logistica/comprovantes"
                          element={<Logistics screen="proof" />}
                        />
                        <Route
                          path="/admin/logistica/custos"
                          element={<Logistics screen="costs" />}
                        />
                        <Route
                          path="/admin/logistica/planejamento"
                          element={<Logistics screen="route_planning" />}
                        />
                        <Route
                          path="/admin/logistica/indicadores"
                          element={<Logistics screen="indicators" />}
                        />
                        <Route
                          path="/admin/logistica/reversa"
                          element={<Logistics screen="reverse_logistics" />}
                        />
                        <Route
                          path="/admin/logistica/app-motorista"
                          element={<Logistics screen="driver_app" />}
                        />
                        <Route
                          path="/admin/logistica/relatorios"
                          element={<Logistics screen="reports" />}
                        />
                        <Route path="/admin/vendas" element={<SalesDashboardPage />} />
                        <Route path="/admin/vendas/pedidos" element={<SalesOrdersPage />} />
                        <Route path="/admin/vendas/faturamento" element={<InvoicingPage />} />
                        <Route path="/admin/vendas/nfe" element={<NfePage />} />
                        <Route path="/admin/vendas/nfce" element={<NfcePage />} />
                        <Route path="/admin/vendas/contratos" element={<ContractsPage />} />
                        <Route path="/admin/vendas/devolucoes" element={<SalesReturnsPage />} />
                        <Route path="/admin/vendas/historico" element={<SalesHistoryPage />} />
                        <Route path="/admin/estoque" element={<StockPage screen="dashboard" />} />
                        <Route
                          path="/admin/estoque/movimentacoes"
                          element={<StockPage screen="movements" />}
                        />
                        <Route
                          path="/admin/estoque/inventario"
                          element={<StockPage screen="inventory" />}
                        />
                        <Route
                          path="/admin/estoque/transferencias"
                          element={<StockPage screen="transfers" />}
                        />
                        <Route
                          path="/admin/estoque/ajustes"
                          element={<StockPage screen="adjustments" />}
                        />
                        <Route
                          path="/admin/estoque/lotes"
                          element={<StockPage screen="batches" />}
                        />
                        <Route
                          path="/admin/estoque/validade"
                          element={<StockPage screen="expiry" />}
                        />
                        <Route
                          path="/admin/estoque/localizacoes"
                          element={<StockPage screen="locations" />}
                        />
                        <Route
                          path="/admin/estoque/separacao"
                          element={<StockPage screen="picking" />}
                        />
                        <Route
                          path="/admin/estoque/conferencia"
                          element={<StockPage screen="checking" />}
                        />
                        <Route
                          path="/admin/estoque/expedicao"
                          element={<StockPage screen="expedition" />}
                        />
                        <Route
                          path="/admin/estoque/recebimento"
                          element={<StockPage screen="receiving" />}
                        />
                        <Route
                          path="/admin/estoque/enderecamento"
                          element={<StockPage screen="putaway" />}
                        />
                        <Route path="/admin/estoque/ondas" element={<StockPage screen="waves" />} />
                        <Route
                          path="/admin/estoque/reabastecimento"
                          element={<StockPage screen="replenishment" />}
                        />
                        <Route
                          path="/admin/estoque/wms-alertas"
                          element={<WmsScreen screen="wms-alerts" />}
                        />
                        <Route
                          path="/admin/estoque/wms-relatorios"
                          element={<WmsScreen screen="wms-reports" />}
                        />
                        <Route
                          path="/admin/estoque/wms-pallets"
                          element={<WmsScreen screen="wms-pallets" />}
                        />
                        <Route
                          path="/admin/estoque/wms-volumes"
                          element={<WmsScreen screen="wms-volumes" />}
                        />
                        <Route
                          path="/admin/estoque/wms-coletores"
                          element={<WmsScreen screen="wms-collectors" />}
                        />
                        <Route
                          path="/admin/estoque/wms-operadores"
                          element={<WmsScreen screen="wms-operators" />}
                        />
                        <Route
                          path="/admin/estoque/wms-managerial"
                          element={<WmsScreen screen="wms-managerial" />}
                        />
                        <Route path="/admin/configuracoes" element={<ConfiguracoesLayout />}>
                          <Route index element={<Navigate to="dados-empresa" replace />} />
                          <Route path="dados-empresa" element={<EmpresaScreen />} />
                          <Route path="parametros" element={<ParametrosScreen />} />
                          <Route path="permissoes" element={<PermissionMatrixScreen />} />
                          <Route path="logs" element={<LogsScreen />} />
                          <Route
                            path="integracoes"
                            element={<ConfigCrudScreen config={INTEGRATIONS_CONFIG} />}
                          />
                          <Route path="apis" element={<ApisScreen />} />
                          <Route path="importacao-exportacao" element={<ImportExportScreen />} />
                          <Route
                            path="modelos-email"
                            element={<ConfigCrudScreen config={EMAIL_TEMPLATE_CONFIG} />}
                          />
                          <Route
                            path="modelos-documentos"
                            element={<ConfigCrudScreen config={DOC_TEMPLATE_CONFIG} />}
                          />
                          <Route
                            path="notificacoes"
                            element={<ConfigCrudScreen config={NOTIFICATION_CONFIG} />}
                          />
                          <Route
                            path="numeracoes"
                            element={<ConfigCrudScreen config={NUMERATION_CONFIG} />}
                          />
                          <Route path="seguranca" element={<SegurancaScreen />} />
                          <Route path="backup" element={<BackupScreen />} />
                        </Route>
                        <Route
                          path="/admin/financeiro"
                          element={<Financial screen="dashboard" />}
                        />
                        <Route
                          path="/admin/financeiro/contas-receber"
                          element={<Financial screen="receivables" />}
                        />
                        <Route
                          path="/admin/financeiro/contas-pagar"
                          element={<Financial screen="payables" />}
                        />
                        <Route
                          path="/admin/financeiro/fluxo-caixa"
                          element={<Financial screen="cash_flow" />}
                        />
                        <Route
                          path="/admin/financeiro/conciliacao"
                          element={<Financial screen="reconciliation" />}
                        />
                        <Route
                          path="/admin/financeiro/tesouraria"
                          element={<Financial screen="treasury" />}
                        />
                        <Route
                          path="/admin/financeiro/cheques"
                          element={<Financial screen="checks" />}
                        />
                        <Route
                          path="/admin/financeiro/cartoes"
                          element={<Financial screen="cards" />}
                        />
                        <Route
                          path="/admin/financeiro/boletos"
                          element={<Financial screen="boletos" />}
                        />
                        <Route path="/admin/financeiro/pix" element={<Financial screen="pix" />} />
                        <Route
                          path="/admin/financeiro/cobrancas"
                          element={<Financial screen="collections" />}
                        />
                        <Route
                          path="/admin/financeiro/caixa"
                          element={<Financial screen="cash_register" />}
                        />
                        <Route
                          path="/admin/financeiro/movimentacoes"
                          element={<Financial screen="movements" />}
                        />
                        <Route
                          path="/admin/financeiro/transferencias"
                          element={<Financial screen="transfers" />}
                        />
                        <Route
                          path="/admin/financeiro/aprovacoes"
                          element={<Financial screen="approvals" />}
                        />
                        <Route
                          path="/admin/financeiro/fechamento"
                          element={<Financial screen="closing" />}
                        />
                        <Route
                          path="/admin/financeiro/relatorios"
                          element={<Financial screen="reports" />}
                        />
                        <Route path="/admin/rh" element={<RH screen="dashboard" />} />
                        <Route path="/admin/rh/colaboradores" element={<RH screen="employees" />} />
                        <Route path="/admin/rh/cargos" element={<RH screen="positions" />} />
                        <Route
                          path="/admin/rh/departamentos"
                          element={<RH screen="departments" />}
                        />
                        <Route path="/admin/rh/ponto" element={<RH screen="time_control" />} />
                        <Route path="/admin/rh/ferias" element={<RH screen="vacations" />} />
                        <Route path="/admin/rh/folha" element={<RH screen="payroll" />} />
                        <Route path="/admin/rh/beneficios" element={<RH screen="benefits" />} />
                        <Route path="/admin/rh/treinamentos" element={<RH screen="trainings" />} />
                        <Route path="/admin/rh/documentos" element={<RH screen="documents" />} />
                        <Route path="/admin/rh/aprovacoes" element={<RH screen="approvals" />} />
                        <Route path="/admin/rh/relatorios" element={<RH screen="reports" />} />
                        <Route path="/admin/conformidade" element={<Conformidade />} />
                        <Route path="/admin/fiscal" element={<Fiscal screen="dashboard" />} />
                        <Route path="/admin/fiscal/entrada" element={<Fiscal screen="entrada" />} />
                        <Route path="/admin/fiscal/nfe" element={<Fiscal screen="nfe" />} />
                        <Route path="/admin/fiscal/nfse" element={<Fiscal screen="nfse" />} />
                        <Route path="/admin/fiscal/nfce" element={<Fiscal screen="nfce" />} />
                        <Route path="/admin/fiscal/cte" element={<Fiscal screen="cte" />} />
                        <Route path="/admin/fiscal/mdfe" element={<Fiscal screen="mdfe" />} />
                        <Route
                          path="/admin/fiscal/apuracao"
                          element={<Fiscal screen="apuracao" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-dashboard"
                          element={<Fiscal screen="reforma_dashboard" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-cbs-ibs"
                          element={<Fiscal screen="reforma_cbs_ibs" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-seletivo"
                          element={<Fiscal screen="reforma_seletivo" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-classificacao"
                          element={<Fiscal screen="reforma_classificacao" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-regras"
                          element={<Fiscal screen="reforma_regras" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-transicao"
                          element={<Fiscal screen="reforma_transicao" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-creditos"
                          element={<Fiscal screen="reforma_creditos" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-simulador"
                          element={<Fiscal screen="reforma_simulador" />}
                        />
                        <Route
                          path="/admin/fiscal/reforma-validacao"
                          element={<Fiscal screen="reforma_validacao" />}
                        />
                        <Route path="/admin/fiscal/sped" element={<Fiscal screen="sped" />} />
                        <Route path="/admin/fiscal/livros" element={<Fiscal screen="livros" />} />
                        <Route
                          path="/admin/fiscal/correcao"
                          element={<Fiscal screen="correcao" />}
                        />
                        <Route
                          path="/admin/fiscal/manifestacao"
                          element={<Fiscal screen="manifestacao" />}
                        />
                        <Route
                          path="/admin/fiscal/documentos"
                          element={<Fiscal screen="documentos" />}
                        />
                        <Route
                          path="/admin/fiscal/inutilizacao"
                          element={<Fiscal screen="inutilizacao" />}
                        />
                        <Route
                          path="/admin/fiscal/certificados"
                          element={<Fiscal screen="certificados" />}
                        />
                        <Route
                          path="/admin/fiscal/configuracoes"
                          element={<Fiscal screen="configuracoes" />}
                        />
                        <Route
                          path="/admin/fiscal/relatorios"
                          element={<Fiscal screen="relatorios" />}
                        />
                        <Route path="/admin/crm" element={<CRM screen="dashboard" />} />
                        <Route path="/admin/crm/leads" element={<CRM screen="leads" />} />
                        <Route
                          path="/admin/crm/oportunidades"
                          element={<CRM screen="oportunidades" />}
                        />
                        <Route path="/admin/crm/funil" element={<CRM screen="funil" />} />
                        <Route path="/admin/crm/agenda" element={<CRM screen="agenda" />} />
                        <Route path="/admin/crm/propostas" element={<CRM screen="propostas" />} />
                        <Route path="/admin/crm/historico" element={<CRM screen="historico" />} />
                        <Route path="/admin/crm/atividades" element={<CRM screen="atividades" />} />
                        <Route
                          path="/admin/crm/motivos-perda"
                          element={<CRM screen="motivos-perda" />}
                        />
                        <Route path="/admin/crm/metas" element={<CRM screen="metas" />} />
                        <Route path="/admin/crm/automacao" element={<CRM screen="automacao" />} />
                        <Route path="/admin/crm/relatorios" element={<CRM screen="relatorios" />} />
                        <Route path="/admin/notificacoes" element={<Notifications />} />
                        <Route
                          path="/admin/ia/dashboard"
                          element={<AIModule screen="dashboard" />}
                        />
                        <Route
                          path="/admin/ia/assistente"
                          element={<AIModule screen="assistant" />}
                        />
                        <Route path="/admin/ia/agentes" element={<AIModule screen="agents" />} />
                        <Route
                          path="/admin/ia/automacoes"
                          element={<AIModule screen="automations" />}
                        />
                        <Route path="/admin/ia/fluxos" element={<AIModule screen="flows" />} />
                        <Route
                          path="/admin/ia/base-conhecimento"
                          element={<AIModule screen="knowledge" />}
                        />
                        <Route
                          path="/admin/ia/treinamento"
                          element={<AIModule screen="training" />}
                        />
                        <Route path="/admin/ia/historico" element={<AIModule screen="history" />} />
                        <Route
                          path="/admin/ia/aprovacoes"
                          element={<AIModule screen="approvals" />}
                        />
                        <Route
                          path="/admin/ia/configuracoes"
                          element={<AIModule screen="settings" />}
                        />
                        <Route path="/admin/industria" element={<Industry screen="dashboard" />} />
                        <Route
                          path="/admin/industria/catalogo"
                          element={<Industry screen="catalogo" />}
                        />
                        <Route
                          path="/admin/industria/especificacoes"
                          element={<Industry screen="especificacoes" />}
                        />
                        <Route
                          path="/admin/industria/conversoes"
                          element={<Industry screen="conversoes" />}
                        />
                        <Route path="/admin/industria/bom" element={<Industry screen="bom" />} />
                        <Route
                          path="/admin/industria/engenharia-bom"
                          element={<Industry screen="engenharia-bom" />}
                        />
                        <Route
                          path="/admin/industria/formulacoes"
                          element={<Industry screen="formulacoes" />}
                        />
                        <Route
                          path="/admin/industria/engenharia"
                          element={<Industry screen="engenharia" />}
                        />
                        <Route
                          path="/admin/industria/recursos"
                          element={<Industry screen="recursos" />}
                        />
                        <Route
                          path="/admin/industria/roteiros"
                          element={<Industry screen="roteiros" />}
                        />
                        <Route
                          path="/admin/industria/capacidade"
                          element={<Industry screen="capacidade" />}
                        />
                        <Route
                          path="/admin/industria/plano-mestre"
                          element={<Industry screen="plano-mestre" />}
                        />
                        <Route path="/admin/industria/aps" element={<Industry screen="aps" />} />
                        <Route
                          path="/admin/industria/planejamento"
                          element={<Industry screen="planejamento" />}
                        />
                        <Route
                          path="/admin/industria/custos"
                          element={<Industry screen="custos" />}
                        />
                        <Route
                          path="/admin/industria/ordens-producao"
                          element={<Industry screen="ordens-producao" />}
                        />
                        <Route
                          path="/admin/industria/execucao"
                          element={<Industry screen="execucao" />}
                        />
                        <Route
                          path="/admin/industria/fases"
                          element={<Industry screen="fases" />}
                        />
                        <Route
                          path="/admin/industria/qualidade"
                          element={<Industry screen="qualidade" />}
                        />
                        <Route
                          path="/admin/industria/rastreabilidade"
                          element={<Industry screen="rastreabilidade" />}
                        />
                        <Route path="/admin/industria/kpis" element={<Industry screen="kpis" />} />
                        <Route
                          path="/admin/industria/manutencao"
                          element={<Industry screen="manutencao" />}
                        />
                        <Route
                          path="/admin/industria/calibracao"
                          element={<Industry screen="calibracao" />}
                        />
                        <Route
                          path="/admin/industria/executivo"
                          element={<Industry screen="executivo" />}
                        />
                        <Route path="/admin/phase0-foundation" element={<Phase0Foundation />} />
                        <Route path="/admin/cadastro" element={<AdminRegister />} />
                        <Route path="/admin/recuperar-senha" element={<AdminPasswordRecovery />} />
                        <Route
                          path="/admin/remuneracao"
                          element={<VariableRemuneration screen="dashboard" />}
                        />
                        <Route
                          path="/admin/remuneracao/regras"
                          element={<VariableRemuneration screen="rules" />}
                        />
                        <Route
                          path="/admin/remuneracao/apuracao"
                          element={<VariableRemuneration screen="apuration" />}
                        />
                        <Route
                          path="/admin/remuneracao/simulador"
                          element={<VariableRemuneration screen="simulator" />}
                        />
                        <Route
                          path="/admin/remuneracao/aprovacoes"
                          element={<VariableRemuneration screen="approvals" />}
                        />
                        <Route
                          path="/admin/remuneracao/historico"
                          element={<VariableRemuneration screen="history" />}
                        />
                        <Route
                          path="/admin/remuneracao/contestacoes"
                          element={<VariableRemuneration screen="contests" />}
                        />
                        <Route
                          path="/admin/remuneracao/campanhas"
                          element={<VariableRemuneration screen="campaigns" />}
                        />
                        <Route
                          path="/admin/remuneracao/ranking"
                          element={<VariableRemuneration screen="ranking" />}
                        />
                        <Route
                          path="/admin/remuneracao/metas"
                          element={<VariableRemuneration screen="goals" />}
                        />
                        <Route path="/cliente/login" element={<ClientLogin />} />
                        <Route path="/cliente/cadastro" element={<ClientRegister />} />
                        <Route path="/cliente/recuperar-senha" element={<PasswordRecovery />} />
                        <Route path="/cliente/redefinir-senha" element={<ClientPasswordReset />} />
                        <Route path="/_/" element={<ClientPasswordReset />} />
                        <Route path="/cliente" element={<ClientArea />} />
                        <Route path="/cliente/rastreamento" element={<ClientTracking />} />
                        <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                        <Route path="/politica-comercial" element={<PoliticaComercial />} />
                        <Route path="/termos-de-uso" element={<TermosDeUso />} />
                        <Route path="/politica-de-cookies" element={<PoliticaCookies />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </CmsContentProvider>
                </ClientAuthProvider>
              </SystemParamsProvider>
            </SettingsProvider>
          </AuthorizationProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </BrowserRouter>
)

export default App
