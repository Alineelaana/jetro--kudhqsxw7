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
}
