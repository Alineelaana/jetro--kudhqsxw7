import type { ScreenDoc } from './types'

export const b2bPortalScreenDocs: ScreenDoc[] = [
  {
    route: '/portal/catalogo',
    title: 'Portal B2B • Catálogo de Produtos e Compras',
    description:
      'Catálogo online de autosserviço B2B para clientes corporativos efetuarem pedidos e cotações diretamente no sistema com regras e preços acordados.',
    purpose:
      'Proporcionar aos clientes PJ uma interface rápida e intuitiva para visualização de itens liberados para venda B2B, preços vigentes, quantidade mínima de pedido e adição ao carrinho com sincronização em tempo real.',
    mainWorkflows: [
      {
        title: 'Seleção de Produtos e Carrinho B2B',
        steps: [
          'Filtrar produtos por categoria ou busca textual (código, marca, descrição).',
          'Verificar quantidade mínima de pedido por item e unidade comercial (cx, fardo, un).',
          'Adicionar ao carrinho corporativo com persistência local e validação de quantidade.',
          'Navegar para a conferência e finalização do pedido de venda.',
        ],
      },
    ],
    technicalRules: [
      'Endpoint GET /backend/v1/b2b/products autenticado via coleção clients.',
      'Validação de empresa e filial multitenant vinculadas ao cliente autenticado.',
      'Apenas produtos com status ativo são disponibilizados para compras.',
    ],
    backendCollections: ['products', 'clients', 'partners', 'sales_orders'],
  },
  {
    route: '/portal/carrinho',
    title: 'Portal B2B • Carrinho e Fechamento de Pedido',
    description:
      'Conferência dos itens selecionados, instruções de faturamento/entrega e submissão direta do pedido para a Central de Aprovações.',
    purpose:
      'Permitir que o cliente revise quantidades, consulte o subtotal com faturamento corporativo, indique condições de pagamento solicitadas e observações de entrega.',
    mainWorkflows: [
      {
        title: 'Fechamento e Envio do Pedido B2B',
        steps: [
          'Ajustar quantidades ou remover itens selecionados.',
          'Confirmar ou atualizar o endereço de entrega da mercadoria.',
          'Informar condição de pagamento e notas fiscais de recebimento.',
          'Clicar em "Finalizar e Enviar Pedido", registrando a ordem no ERP.',
        ],
      },
    ],
    technicalRules: [
      'Endpoint POST /backend/v1/b2b/orders/create com geração de numeração B2B-AAAA-XXXX.',
      'O pedido nasce com status "Aguardando Aprovação" e é inserido na coleção order_approval_records.',
      'Notificações em tempo real enviadas para a equipe interna de aprovadores (COMERCIAL, FINANCEIRO, SUP).',
      'Registro imediato de auditoria em b2b_audit_trail.',
    ],
    backendCollections: ['sales_orders', 'order_approval_records', 'notifications', 'b2b_audit_trail'],
  },
  {
    route: '/portal/pedidos',
    title: 'Portal B2B • Acompanhamento de Pedidos',
    description:
      'Área exclusiva onde o cliente consulta o histórico e o status de faturamento/aprovação dos seus pedidos.',
    purpose:
      'Dar total transparência ao cliente quanto ao andamento da aprovação interna, conferência de itens, prazos e justificativas em caso de rejeição.',
    mainWorkflows: [
      {
        title: 'Consulta e Rastreabilidade do Pedido',
        steps: [
          'Visualizar lista cronológica dos pedidos realizados pela conta B2B.',
          'Identificar status (Aguardando Aprovação, Aprovado, Faturado, Cancelado).',
          'Abrir modal de detalhes para ver produtos faturáveis, valores e trilha de eventos.',
        ],
      },
    ],
    technicalRules: [
      'Endpoint GET /backend/v1/b2b/orders com isolamento estrito de cliente (filtra por b2b_client_id ou partner_id).',
      'Endpoint GET /backend/v1/b2b/orders/:id com guard de propriedade do pedido.',
    ],
    backendCollections: ['sales_orders', 'clients', 'partners'],
  },
  {
    route: '/portal/perfil',
    title: 'Portal B2B • Dados da Empresa e Limite de Crédito',
    description:
      'Exibição das informações cadastrais da empresa parceira e consulta de saldo de crédito condicional.',
    purpose:
      'Permitir a conferência dos dados de CNPJ, razão social e endereço. Exibe o limite de crédito disponível APENAS quando liberado internamente.',
    mainWorkflows: [
      {
        title: 'Consulta Cadastral e Financeira',
        steps: [
          'Verificar dados cadastrais da pessoa jurídica.',
          'Conferir limite de crédito total e disponível (se a flag estiver ativa na gestão interna).',
        ],
      },
    ],
    technicalRules: [
      'Regra de negócio permanente: o limite de crédito NÃO é exibido por padrão (default false).',
      'O endpoint GET /backend/v1/b2b/me mascara ou omite valores caso a flag exibir_limite_credito no partner seja false.',
    ],
    backendCollections: ['partners', 'clients'],
  },
  {
    route: '/admin/b2b/clientes',
    title: 'Gestão Interna B2B • Clientes e Governança de Crédito',
    description:
      'Painel corporativo interno para habilitação de clientes no Portal B2B e controle da flag de limite de crédito.',
    purpose:
      'Permitir que operadores e gestores comerciais controlem quem tem acesso ao portal de pedidos e ativem individualmente a visualização do limite de crédito.',
    mainWorkflows: [
      {
        title: 'Governança de Acesso e Crédito B2B',
        steps: [
          'Pesquisar clientes por razão social, CNPJ ou e-mail.',
          'Ativar ou suspender o acesso B2B do cliente através do botão switch.',
          'Ativar individualmente a flag "Exibir Limite de Crédito" após análise do cadastro.',
        ],
      },
    ],
    technicalRules: [
      'Endpoint POST /backend/v1/b2b/admin/toggle-credit-flag com registro em audit_logs.',
      'Endpoint POST /backend/v1/b2b/admin/toggle-client-status para bloqueio ou desbloqueio de contas.',
      'Multitenancy respeitado de acordo com a empresa do operador.',
    ],
    backendCollections: ['partners', 'clients', 'audit_logs'],
  },
  {
    route: '/admin/b2b/pedidos',
    title: 'Gestão Interna B2B • Monitoramento de Pedidos do Portal',
    description:
      'Visualização centralizada de todos os pedidos de venda originados do Portal de Autosserviço B2B.',
    purpose:
      'Permitir aos gestores comerciais e de faturamento acompanhar a demanda vinda do canal digital e encaminhar para a Central de Aprovações.',
    mainWorkflows: [
      {
        title: 'Acompanhamento de Vendas Digitais',
        steps: [
          'Listar pedidos recebidos do canal "Portal B2B".',
          'Verificar cliente, CNPJ, valor total e condição de pagamento solicitada.',
          'Acessar diretamente o fluxo de deliberação na Central de Aprovações.',
        ],
      },
    ],
    technicalRules: [
      'Filtro por sales_channel = "Portal B2B" ou b2b_client_id preenchido.',
      'Integração direta com o motor de aprovação order_approval_process.js.',
    ],
    backendCollections: ['sales_orders', 'order_approval_records'],
  },
]
