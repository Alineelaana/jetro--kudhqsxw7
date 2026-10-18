/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Coleção jeh_knowledge (Base de Conhecimento Oficial)
    const knowCol = new Collection({
      name: 'jeh_knowledge',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'Institucional',
            'O que é o Jetro',
            'Funcionalidades',
            'Departamentos',
            'Implantação',
            'Demonstração',
            'Contato e Suporte',
            'FAQ',
            'Comercial',
            'Outros',
          ],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'keywords', type: 'text' },
        {
          name: 'approval_status',
          type: 'select',
          required: true,
          values: ['rascunho', 'aprovado', 'revisar', 'inativo'],
          maxSelect: 1,
        },
        { name: 'responsible_name', type: 'text' },
        { name: 'source_file', type: 'file', maxSelect: 1, maxSize: 10485760 },
        { name: 'source_type', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_jeh_know_cat ON jeh_knowledge (category)',
        'CREATE INDEX idx_jeh_know_status ON jeh_knowledge (approval_status)',
      ],
    })
    app.save(knowCol)

    // 2. Coleção jeh_qa (Perguntas e Respostas com Variações)
    const qaCol = new Collection({
      name: 'jeh_qa',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'canonical_question', type: 'text', required: true },
        { name: 'official_answer', type: 'text', required: true },
        { name: 'variations', type: 'json' },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'Institucional',
            'O que é o Jetro',
            'Funcionalidades',
            'Departamentos',
            'Implantação',
            'Demonstração',
            'Contato e Suporte',
            'FAQ',
            'Comercial',
            'Outros',
          ],
          maxSelect: 1,
        },
        {
          name: 'approval_status',
          type: 'select',
          required: true,
          values: ['rascunho', 'aprovado', 'revisar', 'inativo'],
          maxSelect: 1,
        },
        { name: 'keywords', type: 'text' },
        { name: 'hit_count', type: 'number' },
        { name: 'responsible_name', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_jeh_qa_cat ON jeh_qa (category)',
        'CREATE INDEX idx_jeh_qa_status ON jeh_qa (approval_status)',
      ],
    })
    app.save(qaCol)

    // 3. Coleção jeh_unanswered (Perguntas sem Resposta)
    const unCol = new Collection({
      name: 'jeh_unanswered',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'count', type: 'number' },
        { name: 'identified_topic', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'em_analise', 'respondida', 'descartada'],
          maxSelect: 1,
        },
        { name: 'assigned_answer', type: 'text' },
        { name: 'source', type: 'select', values: ['publico', 'teste'], maxSelect: 1 },
        { name: 'last_asked_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_jeh_unans_status ON jeh_unanswered (status)'],
    })
    app.save(unCol)

    // 4. Coleção jeh_test_evaluations (Avaliações de Teste e Treinamento)
    const evalCol = new Collection({
      name: 'jeh_test_evaluations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'user_name', type: 'text' },
        { name: 'user_question', type: 'text', required: true },
        { name: 'assistant_response', type: 'text', required: true },
        {
          name: 'rating',
          type: 'select',
          required: true,
          values: ['correta', 'parcial', 'incorreta'],
          maxSelect: 1,
        },
        { name: 'feedback_notes', type: 'text' },
        { name: 'suggested_correction', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente_validacao', 'aprovada_na_base', 'rejeitada'],
          maxSelect: 1,
        },
        { name: 'target_category', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_jeh_eval_rating ON jeh_test_evaluations (rating)'],
    })
    app.save(evalCol)

    // 5. Configuração de status inicial da Jeh no banco (INATIVA por padrão)
    const settingsCol = app.findCollectionByNameOrId('settings')
    let jehStatusRec = null
    try {
      jehStatusRec = app.findFirstRecordByData('settings', 'key', 'jeh_assistant_status')
    } catch (_) {}

    if (!jehStatusRec) {
      jehStatusRec = new Record(settingsCol)
      jehStatusRec.set('key', 'jeh_assistant_status')
      jehStatusRec.set('value', 'inativa')
      app.save(jehStatusRec)
    }

    let floatRec = null
    try {
      floatRec = app.findFirstRecordByData('settings', 'key', 'floating_chat_visible')
    } catch (_) {}
    if (floatRec) {
      floatRec.set('value', 'false')
      app.save(floatRec)
    } else {
      floatRec = new Record(settingsCol)
      floatRec.set('key', 'floating_chat_visible')
      floatRec.set('value', 'false')
      app.save(floatRec)
    }

    // 6. Migrar dados existentes de ai_training para jeh_knowledge e jeh_qa
    try {
      const existingTrainings = app.findRecordsByFilter(
        'ai_training',
        "id != ''",
        '-created',
        100,
        0,
      )
      for (let i = 0; i < existingTrainings.length; i++) {
        const t = existingTrainings[i]
        const title = t.getString('title') || 'Conteúdo Institucional'
        const content = t.getString('content') || ''
        const type = t.getString('type')

        if (type === 'qa') {
          const qr = new Record(qaCol)
          qr.set('canonical_question', title)
          qr.set('official_answer', content)
          qr.set('variations', [title, 'Como funciona ' + title])
          qr.set('category', 'FAQ')
          qr.set('approval_status', 'aprovado')
          qr.set('keywords', 'jetro, ' + title.toLowerCase())
          qr.set('hit_count', 0)
          qr.set('responsible_name', 'Sistema (Migração)')
          app.save(qr)
        } else {
          const kr = new Record(knowCol)
          kr.set('title', title)
          kr.set(
            'category',
            title.toLowerCase().includes('apresentação') ? 'O que é o Jetro' : 'Institucional',
          )
          kr.set('content', content)
          kr.set('keywords', 'jetro, institucional, erp, logística')
          kr.set('approval_status', 'aprovado')
          kr.set('responsible_name', 'Sistema (Migração)')
          app.save(kr)
        }
      }
    } catch (e6) {
      console.log('Error migrating ai_training:', e6)
    }

    // 7. Definir o agente nativo da Jeh Institucional
    $ai.agents.define(app, {
      slug: 'jeh-institucional',
      name: 'Jeh — Assistente Institucional Jetro',
      description:
        'Assistente de IA institucional e comercial pública da plataforma Jetro. Especializada em explicar a empresa, produtos, serviços, módulos e canais de contato com base exclusivamente na base de conhecimento oficial aprovada.',
      systemPrompt:
        'Você é a Jeh, a assistente institucional e comercial do Jetro. ' +
        'Seu papel é apresentar o ecossistema Jetro, explicar o que é o sistema, suas funcionalidades, departamentos, modelo de implantação, agendamento de demonstrações e canais oficiais de contato.\n\n' +
        'REGRAS MANDATÓRIAS DE SEGURANÇA E CONFORMIDADE:\n' +
        '1. BASE EXCLUSIVA: Responda baseando-se EXCLUSIVAMENTE nos conteúdos oficiais da Base de Conhecimento e de Perguntas e Respostas aprovados da Jetro.\n' +
        '2. PROIBIÇÃO DE INVENÇÃO (NÃO SABE = NÃO INVENTA): Se você não tiver uma informação confirmada ou se a pergunta estiver fora da base aprovada, NUNCA invente preços, prazos, integrações, clientes ou funcionalidades. Responda com a frase padrão oficial: "Não tenho essa informação confirmada no momento, mas posso orientar você a entrar em contato com nossa equipe." e ofereça os canais oficiais (WhatsApp (31) 99129-7619 ou formulário de apresentação comercial).\n' +
        '3. SEPARAÇÃO TOTAL DE DADOS INTERNOS DO ERP: Você NUNCA tem acesso a pedidos, notas fiscais, faturamento, estoque, dados bancários, folha de pagamento ou qualquer dado interno e sigiloso de clientes e usuários do ERP. Você é puramente institucional e comercial.\n' +
        '4. TOM DE VOZ: Educada, simpática, prestativa, moderna e profissional em Português do Brasil.',
      tier: 'fast',
      tools: [
        {
          collection: 'jeh_knowledge',
          perms: { list: true, read: true },
          actAs: 'admin',
          scopeFilter: "approval_status = 'aprovado'",
        },
        {
          collection: 'jeh_qa',
          perms: { list: true, read: true },
          actAs: 'admin',
          scopeFilter: "approval_status = 'aprovado'",
        },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text:
              'O Jetro é um ecossistema completo de gestão integrada e tecnologia logística para indústrias, distribuidores, operadores logísticos e empresas em geral. ' +
              'Oferece módulos de Comercial, Faturamento, Fiscal (NF-e, NFC-e, CT-e, MDF-e, NFS-e), Financeiro, WMS, Logística e Transporte, Indústria e Produção, DP, RH, SST e Segundo Cérebro corporativo. ' +
              'Para solicitar uma demonstração ou apresentação comercial, o visitante pode preencher o formulário no site ou entrar em contato pelo WhatsApp oficial (31) 99129-7619.',
          },
        },
        {
          type: 'faq',
          payload: {
            qa: [
              {
                question: 'O que é o Jetro?',
                answer:
                  'O Jetro é uma plataforma integrada de gestão empresarial (ERP) e logística avançada, projetada para conectar operações comerciais, financeiras, fiscais, de estoque, transporte e indústria em uma única inteligência.',
              },
              {
                question: 'Como solicitar uma demonstração?',
                answer:
                  'Você pode solicitar uma apresentação comercial preenchendo o formulário de contato disponível no nosso site ou falando diretamente com nossos consultores pelo WhatsApp oficial (31) 99129-7619.',
              },
              {
                question: 'O Jetro é um ERP?',
                answer:
                  'Sim! O Jetro é um ERP completo e especializado que cobre todas as etapas operacionais, gerenciais, fiscais e estratégicas da sua empresa.',
              },
            ],
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'jeh-institucional')
    } catch (_) {}
    try {
      const c1 = app.findCollectionByNameOrId('jeh_test_evaluations')
      if (c1) app.delete(c1)
      const c2 = app.findCollectionByNameOrId('jeh_unanswered')
      if (c2) app.delete(c2)
      const c3 = app.findCollectionByNameOrId('jeh_qa')
      if (c3) app.delete(c3)
      const c4 = app.findCollectionByNameOrId('jeh_knowledge')
      if (c4) app.delete(c4)
    } catch (_) {}
  },
)
