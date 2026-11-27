import type { ScreenDocEntry } from './types'

/**
 * GOVERNANÇA DOCUMENTAL (padrão AvatarSi) — v0.0.754
 * Documenta SOMENTE o que está implementado na tela
 * /admin/configuracoes/governanca-documental (src/components/governance/governance-screen.tsx)
 * e nos serviços/hooks de governança.
 */
export const GOVERNANCA_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/configuracoes/governanca-documental': {
    route: '/admin/configuracoes/governanca-documental',
    title: 'Governança Documental',
    moduleGroup: 'Configurações',
    docVersion: '1.0.0',
    lastUpdated: '2026-11-27',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Organizar o acervo documental da empresa segundo o padrão de governança documental AvatarSi: numeração única e permanente por documento, código legível PROJETO_TIPO_NNN, versionamento semântico (minuta V0.1.0 → primeira versão liberada V1.0.0), fluxo de ciclo de vida com revisão/aprovação/liberação e checklist de liberação item a item, com trilha de auditoria de todas as decisões.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Acervo de documentos com busca por número único, código documental, título e versão.\n- Criação de documento com projeto (código), tipo documental, título, finalidade, público, canais autorizados e classificação.\n- 18 tipos documentais da norma pré-cadastrados por empresa (migração 0363: NGD, POP, COM, ATA, API, APC, AIN, PLN, EST, FIN, TRB, JUR, PRO, TEC, MOP, GOV, MKT) e projeto inicial "Geral" (GER).\n- Visualização dos tipos documentais e do projeto "Geral" carregados da empresa (somente leitura na tela; os registros são criados pela migração 0363).\n- Visualização, apenas para SUP, dos papéis do fluxo configurados por empresa (elaboradores, revisores técnicos, revisores de identidade, revisor jurídico, revisor fiscal, revisor financeiro, aprovador, liberador, divulgador) — somente leitura na tela; a edição desses cadastros não está implementada.\n- Fluxo de status do documento: Em elaboração → Em revisão → Em aprovação → Aprovado → Publicado/vigente, com Obsoleto/Revogado e retomada.\n- Checklist de liberação item a item com confirmação individual (quem confirmou e quando).\n- Histórico de versões liberadas (snapshot imutável por liberação).\n- Trilha de auditoria das transições (evento, usuário, papel, data, detalhes).\n- Ciência da norma de governança pelos integrantes (registro de ciência com nome, função e data).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Número Único Permanente: o doc_number é gerado exclusivamente no backend (hook governance_numbering.js) a partir de contador atômico na coleção numerations; não há reuso de número nem edição posterior — tentativa de alterar doc_number ou doc_code em update é rejeitada mesmo para SUP.\n- Código Documental Legível: doc_code = PROJETO_TIPO_NNN (3 dígitos, sequência por empresa + projeto + tipo), gerado no backend no momento da criação.\n- Versionamento Semântico: documento nasce como minuta V0.1.0 (status Em elaboração); a primeira liberação é V1.0.0; a próxima versão é calculada por tipo de alteração (patch/minor/major) no endpoint /backend/v1/governance/next-version e exige resumo da alteração.\n- Fluxo AvatarSi: enviar_revisao (apenas a partir de Em elaboração), aprovar (a partir de Em revisão), devolver/rejeitar (retorna a Em elaboração com pendência sinalizada e justificativa), liberar (apenas a partir de Aprovado; exige checklist integralmente confirmado), revogar (a partir de Publicado/Obsoleto) e retomar.\n- Classificação: 4 níveis — Público, Interno, Confidencial e Restrito.\n- Liberação: somente versão liberada é publicável/vigente; a liberação grava o snapshot da versão em governance_document_versions com nome de arquivo AVSI_<CÓDIGO>_V<versão>_<data>.\n- Isolamento por Empresa: todas as coleções governance_* aplicam regras por empresa (usuário só vê/opera documentos da própria empresa; SUP irrestrito) e os endpoints validam a empresa do documento/norma contra a do usuário autenticado.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa /admin/configuracoes/governanca-documental pelo menu lateral (Configurações).\n2. Para criar um documento, informa projeto, tipo documental, título, classificação, finalidade, público e canais autorizados; o backend atribui o número único e o código PROJETO_TIPO_NNN e o documento nasce como minuta V0.1.0 (Em elaboração).\n3. O elaborador envia para revisão; o revisor aprova ou devolve/rejeita com justificativa.\n4. Com o documento Aprovado, o liberador confirma o checklist item a item; todos os itens confirmados, a versão é liberada (publicada/vigente) e o snapshot entra no histórico de versões.\n5. Cada transição grava trilha de auditoria; o acervo permite localizar o documento por número, código, título ou versão.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase (migração 0363): governance_documents, governance_document_versions, governance_release_checklist, governance_audit_trail, governance_projects, governance_document_types, governance_workflow_config, governance_norms, governance_norm_acknowledgments.\n- Contador de numeração: coleção numerations (chave governance_documents, migração 0364).\n- Backfill 0363: documentos antigos (document_templates) entram no acervo como Em elaboração V0.1.0 com pendência sinalizada, SEM presumir aprovação.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Hooks backend: governance_numbering.js (numeração atômica e bloqueio de alteração de número/código) e governance_api.js (endpoints POST /backend/v1/governance/next-version, /transition, /checklist e /norm-ack).\n- Serviço frontend: src/services/governance.ts (pb.send para os endpoints /backend/v1/governance/...).\n- Herda o contexto de empresa ativa do sistema (multitenancy).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso à tela pelo menu Configurações (canViewConfiguracoes).\n- Configuração de projetos, tipos documentais e papéis restrita ao perfil SUP (podeConfigurar = role SUP).\n- Endpoints exigem sessão autenticada e validam empresa do documento/norma; SUP é irrestrito.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componente: src/components/governance/governance-screen.tsx (acervo + norma/ciência em abas, diálogos de novo documento, nova versão e liberação).\n- Serviço: src/services/governance.ts.\n- Migrações: 0363_governanca_documental_avatarsi.js e 0364_governance_numeration.js.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Tentativa de alterar doc_number/doc_code de documento existente é rejeitada pelo backend com mensagem explícita (número/código permanentes).\n- Transição inválida para o status atual é recusada com mensagem do fluxo (ex.: liberar sem estar Aprovado).\n- Liberação com checklist incompleto é bloqueada com indicação da versão pendente.\n- Motivo/observação é obrigatório em aprovar, devolver, rejeitar, liberar e revogar.\n- Operações em documento/norma de outra empresa retornam 403.',
    },
  },

  '/admin/configuracoes/modelos-documentos': {
    route: '/admin/configuracoes/modelos-documentos',
    title: 'Modelo de Documento (Governança AvatarSi)',
    moduleGroup: 'Configurações',
    docVersion: '1.1.0',
    lastUpdated: '2026-11-27',
    author: 'Engenharia de Software HURAM',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar os modelos de documento do ERP (coleção document_templates) com o modelo integrado à esteira de governança documental AvatarSi: cada modelo possui registro correspondente em governance_documents (vínculo template_id → document_templates.id) com número único permanente, código documental legível, versão, classificação, status de ciclo de vida e checklist de liberação, gerenciados a partir da própria tela.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- CRUD de modelos de documento (nome, categoria, empresa, filial, cabeçalho, corpo, rodapé, orientação, tamanho de papel, numeração de páginas, modelo padrão), com busca e ativação/desativação.\n- Colunas adicionais de governança na listagem: Número (número único), Código (PROJETO_TIPO_NNN), Versão, Classificação e Status do documento de governança vinculado ao modelo.\n- Badge "Pendência de governança" nos modelos cujo documento de governança não foi localizado pelo vinculo template_id.\n- Badge "Pendência" em documentos com pending_review (ex.: integrados pelo backfill sem presumir aprovação).\n- Botão "Fluxo" por linha, abrindo o diálogo de fluxo de governança: enviar para revisão, aprovar, devolver ao elaborador e liberar (publicar/vigente) com checklist de liberação item a item, sem sair da tela.\n- Fluxo reutiliza os mesmos endpoints /backend/v1/governance/transition e /backend/v1/governance/checklist usados pela tela Governança Documental.\n- Ao salvar um modelo (criação ou edição), o registro de governança é garantido de forma idempotente: se não existir documento com aquele template_id, um novo é criado (status Em elaboração V0.1.0, classificação Interna, pendência sinalizada).',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Vínculo modelo ↔ governança: o registro em governance_documents referencia o modelo pelo campo template_id; um modelo tem no máximo um documento de governança associado.\n- Criação idempotente: ao salvar, o sistema primeiro busca documento existente por template_id e só cria quando não houver; modelos antigos já receberam documento no backfill da migração 0363.\n- Número único e código documental: gerados exclusivamente pelo backend (hook governance_numbering.js, contador atômico na coleção numerations); código no formato PROJETO_TIPO_NNN, com projeto derivado da categoria do modelo (maiúsculas, até 12 caracteres) e tipo fixo MOP (modelo de documento).\n- O documento de governança nasce sempre como minuta V0.1.0 (Em elaboração, classificação Interna) — a tela NÃO presume aprovação de modelos antigos; o badge "Pendência" sinaliza o pending_review.\n- Novo modelo criado por fora da tela (sem registro de governança) pode ser integrado pelo botão "Fluxo", que cria o registro idempotente antes de abrir o diálogo.\n- Transições seguem o fluxo AvatarSi (enviar_revisao → aprovar → liberar) com trilha de auditoria; revogar/retomar e nova versão permanecem na tela Governança Documental.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa /admin/configuracoes/modelos-documentos pelo menu lateral (Configurações).\n2. A listagem exibe, além dos dados do modelo, as colunas de governança (Número, Código, Versão, Classificação, Status) e o badge de pendência quando aplicável.\n3. Ao criar ou editar um modelo, o salvamento dispará a garantia de registro de governança: documento existente é reutilizado; caso contrário, um novo é criado com número único e código PROJETO_TIPO_NNN atribuídos pelo backend, visíveis na listagem após recarga.\n4. O botão "Fluxo" (ícone de ramificação) na linha abre o diálogo de fluxo; a partir do status atual o usuário envia para revisão, aprova, devolve ou libera com checklist item a item.\n5. Cada transição é registrada na auditoria da governança e a listagem é recarregada para refletir o novo status.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Modelos: coleção PocketBase document_templates (CRUD via src/services/configuracoes.ts).\n- Governança: coleções governance_documents e governance_release_checklist (migração 0363), vinculadas por template_id.\n- Numeração: coleção numerations (migração 0364) alimentada pelo hook governance_numbering.js.\n- Transições e checklist: endpoints /backend/v1/governance/transition e /backend/v1/governance/checklist (hook governance_api.js).',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Componente de integração: src/components/governance/doc-template-governance.tsx (badge, colunas, diálogo de fluxo e garantia idempotente de registro).\n- Wrapper da tela: src/components/governance/doc-templates-governance-screen.tsx (injeta colunas/ações/callbacks no ConfigCrudScreen).\n- Serviço compartilhado: src/services/governance.ts (mesmos helpers e endpoints da tela Governança Documental).\n- Tela irmã: /admin/configuracoes/governanca-documental (acervo completo, revogar/retomar, nova versão, norma e ciência).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso à tela pelo menu Configurações (canViewConfiguracoes).\n- Transições de fluxo exigem sessão autenticada; os endpoints validam a empresa do documento contra a do usuário (SUP irrestrito).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componente: src/components/configuracoes/config-crud-screen.tsx (CRUD base, com suporte a extraColumns/extraActions/onAfterCreate/onAfterUpdate).\n- Componente: src/components/governance/doc-template-governance.tsx (integração de governança).\n- Serviços: src/services/configuracoes.ts e src/services/governance.ts.\n- Migrações: 0363_governanca_documental_avatarsi.js (coleções e backfill) e 0364_governance_numeration.js (contador).',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Falha ao criar o registro de governança após salvar o modelo: o modelo é gravado normalmente e um toast destructive informa "Documento salvo, mas sem registro de governança" com o detalhe do erro; a listagem marca o modelo com badge de pendência.\n- Falha na transição (fluxo inválido para o status, checklist incompleto na liberação, motivo ausente): toast destructive com a mensagem retornada pelo endpoint; o diálogo permanece aberto.\n- Modelos sem documento de governança na listagem exibem badge "Pendência de governança" na coluna Status.\n- Itens de checklist pendentes na liberação são confirmados automaticamente antes da chamada de liberar (avisado no diálogo).',
    },
  },
}
