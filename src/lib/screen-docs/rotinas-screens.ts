import type { ScreenDocEntry } from './types'

export const ROTINAS_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/rotinas/liberacoes-comerciais': {
    route: '/admin/rotinas/liberacoes-comerciais',
    title: 'Liberações comerciais',
    moduleGroup: 'Rotinas',
    docVersion: '1.0.0',
    lastUpdated: '2026-11-28',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Fila de análise das solicitações de liberação comercial geradas automaticamente quando um pedido de venda apresenta divergência em relação às regras vigentes (desconto, crédito, prazo, quantidade). Permite ao analista aplicar ou recusar cada divergência, consultando a ficha do cliente sem perder o contexto da fila.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Abas com contagens: Pendentes, Aprovadas, Recusadas e Todas.\n- Colunas: tipo de divergência (até 2 primeiras com contador "+N"), número do pedido, valor, status, vendedor/RCA, cliente, responsável pela análise, solicitante, tipo de negociação, operação, tipo de frete, data e ações.\n- Busca por número do pedido ou cliente; painel de filtros (Período de/até, Status, Empresa/Filial, RCA, Responsável, Tipo de divergência).\n- "Ver liberação" com expansão de cada divergência: produto (código e descrição), quantidade, preço de tabela, desconto solicitado, valor com desconto, IPI, ST, valor unitário com impostos e observação da decisão.\n- Por divergência pendente: ✓ Aplicar (aprova a condição) ou ✕ Recusar com motivo obrigatório em diálogo próprio.\n- Histórico de decisões da solicitação (decisão, divergência, limites, data, autor e motivo).\n- "Ver cliente": abre a ficha do cliente em /admin/comercial/clientes preservando os filtros da fila na URL (retorno=liberacoes), com botão de volta na ficha.\n- "Gerar relatório": exportação Excel com todos os registros dos filtros aplicados, com totais separados de pedidos e divergências.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- A fila recebe automaticamente pedidos com divergência comercial (status "Aguardando liberação").\n- Primeira decisão válida vence: tentativas de decidir divergência já decidida retornam 409 e a tela recarrega informando que outro usuário analisou.\n- Recusa exige motivo obrigatório; o pedido permanece bloqueado para o RCA ajustar e reenviar, preservando o histórico da análise.\n- Todas as divergências aprovadas liberam o pedido para o fluxo normal; com qualquer recusa, o pedido segue bloqueado.\n- Sem responsável pela análise configurado, a tela sinaliza pendência para a gestão atribuir.\n- Multitenancy: a listagem é filtrada pela empresa ativa do usuário logado (empresa_id).\n- Deep-link: ?request=<id> abre a liberação correspondente diretamente (usado pela notificação do sino).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Pedido com divergência comercial entra na fila com status "Aguardando liberação" e o responsável recebe notificação no sino (1 por solicitação; link abre a liberação com ?request=<id>).\n2. O analista acessa /admin/rotinas/liberacoes-comerciais no menu Rotinas e utiliza abas, busca e filtros.\n3. "Ver liberação" expande as divergências do pedido com detalhes comerciais e fiscais.\n4. Para cada divergência pendente, decide ✓ Aplicar ou ✕ Recusar (com motivo obrigatório).\n5. Se necessário, "Ver cliente" abre a ficha do cliente com os filtros preservados; o botão "Voltar para liberações" retorna à fila com o mesmo estado de filtros.\n6. "Gerar relatório" exporta Excel com todos os registros dos filtros, com totais separados de pedidos e divergências.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `commercial_release_requests`, `commercial_release_divergences`, `commercial_release_decisions`, `notifications`, `empresas`.\n- Gatilho de notificação: hook `commercial_release_notify.js`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Serviço de frontend: `src/services/commercial-approvals.ts` (listagem, detalhes, decisões) e `src/services/commercial-approvals-report.ts` (relatório Excel).\n- Endpoints pb_hooks: `POST /backend/v1/commercial-approvals/decide` e `POST /backend/v1/commercial-approvals/notify`; histórico via `GET /backend/v1/commercial-approvals/history/{id}`.\n- Ficha do cliente `/admin/comercial/clientes` (retorno=liberacoes) com destaque do cliente e botão de volta à fila.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso via menu Rotinas para perfis autorizados (SUP irrestrito e perfis comerciais/gestão). Ações de decisão seguem a política comercial do ERP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `CommercialReleasesScreen` (`src/components/rotinas/liberacoes-comerciais-screen.tsx`), `Tabs`, `Dialog`, `Select`, `Badge`, `Button`.\n- Serviços: `commercial-approvals`, `commercial-approvals-report`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Conflito de decisão simultânea (409): aviso "divergência já analisada por outro usuário" e recarga da fila.\n- Recusa sem motivo é bloqueada na interface (frontend) e impeditiva no backend.\n- Falhas de listagem e de exportação exibem toast de erro e mantêm o estado atual da tela.',
    },
  },
}
