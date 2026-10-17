/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Coleção principal: segundo_cerebro_docs (Biblioteca e Documentos Indexados)
    const docsCol = new Collection({
      name: 'segundo_cerebro_docs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'path', type: 'text', required: true },
        {
          name: 'area',
          type: 'select',
          required: true,
          values: [
            'Administração',
            'Comercial',
            'DP & RH',
            'Financeiro',
            'Fiscal',
            'Inteligência',
            'Logística e Operações',
            'Marketing e Trade Marketing',
            'Projetos Estratégicos',
            'Processos e Procedimentos',
            'Tecnologia e Sistemas',
            'Reuniões e Decisões',
            'Políticas e Normas Internas',
          ],
          maxSelect: 1,
        },
        { name: 'category', type: 'text' },
        { name: 'project', type: 'text' },
        { name: 'tags', type: 'json' }, // string[]
        { name: 'wikilinks', type: 'json' }, // string[] de notas vinculadas [[nota]]
        { name: 'content', type: 'text', required: true }, // Conteúdo Markdown completo
        { name: 'summary', type: 'text' },
        { name: 'content_hash', type: 'text', required: true },
        { name: 'sync_date', type: 'text' }, // ISO string
        {
          name: 'sync_source',
          type: 'select',
          values: ['obsidian_file', 'obsidian_zip', 'manual_editor', 'erp_sync'],
          maxSelect: 1,
        },
        {
          name: 'confidentiality',
          type: 'select',
          values: ['Publico', 'Interno', 'Estrategico', 'Confidencial'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['ativo', 'pendente_revisao', 'desatualizado', 'arquivado'],
          maxSelect: 1,
        },
        { name: 'author_id', type: 'text' },
        { name: 'author_name', type: 'text' },
        { name: 'metadata', type: 'json' }, // frontmatter, data da nota original, etc.
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_docs_area ON segundo_cerebro_docs (area)',
        'CREATE INDEX idx_sc_docs_path ON segundo_cerebro_docs (path)',
        'CREATE INDEX idx_sc_docs_hash ON segundo_cerebro_docs (content_hash)',
        'CREATE INDEX idx_sc_docs_project ON segundo_cerebro_docs (project)',
        'CREATE INDEX idx_sc_docs_conf ON segundo_cerebro_docs (confidentiality)',
        'CREATE INDEX idx_sc_docs_status ON segundo_cerebro_docs (status)',
      ],
    })
    app.save(docsCol)

    // 2. Memória de Decisões: segundo_cerebro_decisions
    const decisionsCol = new Collection({
      name: 'segundo_cerebro_decisions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'subject', type: 'text', required: true },
        { name: 'date', type: 'text', required: true }, // YYYY-MM-DD
        { name: 'context', type: 'text' },
        { name: 'responsibles', type: 'json' }, // string[]
        { name: 'decision', type: 'text', required: true },
        { name: 'justification', type: 'text' },
        { name: 'impacts', type: 'text' },
        { name: 'next_steps', type: 'text' },
        { name: 'document_source_id', type: 'text' },
        { name: 'document_source_title', type: 'text' },
        {
          name: 'classification',
          type: 'select',
          required: true,
          values: [
            'Decisão aprovada',
            'Proposta em análise',
            'Sugestão',
            'Decisão revogada',
            'Pendente',
          ],
          maxSelect: 1,
        },
        { name: 'has_conflict', type: 'bool' },
        { name: 'conflict_notes', type: 'text' },
        { name: 'conflict_sources', type: 'json' },
        { name: 'area', type: 'text' },
        { name: 'project', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_decisions_subject ON segundo_cerebro_decisions (subject)',
        'CREATE INDEX idx_sc_decisions_classif ON segundo_cerebro_decisions (classification)',
        'CREATE INDEX idx_sc_decisions_date ON segundo_cerebro_decisions (date)',
        'CREATE INDEX idx_sc_decisions_project ON segundo_cerebro_decisions (project)',
      ],
    })
    app.save(decisionsCol)

    // 3. Radar de Oportunidades: segundo_cerebro_opportunities
    const opportunitiesCol = new Collection({
      name: 'segundo_cerebro_opportunities',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'area', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: [
            'Redução de custos',
            'Automação',
            'Risco operacional',
            'Inconsistência documental',
            'Oportunidade comercial',
          ],
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        { name: 'evidence', type: 'text', required: true },
        { name: 'potential_impact', type: 'text' },
        {
          name: 'priority',
          type: 'select',
          required: true,
          values: ['Alta', 'Média', 'Baixa'],
          maxSelect: 1,
        },
        { name: 'recommendation', type: 'text', required: true },
        { name: 'sources', type: 'json' }, // { doc_id, title, excerpt }[]
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Em análise', 'Aprovada', 'Descartada', 'Implementada'],
          maxSelect: 1,
        },
        { name: 'status_notes', type: 'text' },
        { name: 'evaluated_by', type: 'text' },
        { name: 'evaluated_at', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_opp_status ON segundo_cerebro_opportunities (status)',
        'CREATE INDEX idx_sc_opp_type ON segundo_cerebro_opportunities (type)',
        'CREATE INDEX idx_sc_opp_priority ON segundo_cerebro_opportunities (priority)',
        'CREATE INDEX idx_sc_opp_area ON segundo_cerebro_opportunities (area)',
      ],
    })
    app.save(opportunitiesCol)

    // 4. Insights Estratégicos & Análise de Processos: segundo_cerebro_insights
    const insightsCol = new Collection({
      name: 'segundo_cerebro_insights',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'department', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: [
            'Oportunidade',
            'Risco',
            'Informação Contraditória',
            'Processo Duplicado',
            'Etapa Desnecessária',
            'Falta de Documentação',
            'Recomendação',
          ],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'evidence', type: 'text', required: true },
        { name: 'recommendations', type: 'text' },
        { name: 'sources', type: 'json' }, // { doc_id, title }[]
        {
          name: 'status',
          type: 'select',
          values: ['Em análise', 'Validado', 'Descartado', 'Implementado'],
          maxSelect: 1,
        },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_ins_dept ON segundo_cerebro_insights (department)',
        'CREATE INDEX idx_sc_ins_cat ON segundo_cerebro_insights (category)',
        'CREATE INDEX idx_sc_ins_status ON segundo_cerebro_insights (status)',
      ],
    })
    app.save(insightsCol)

    // 5. Histórico e Logs de Sincronização Obsidian: segundo_cerebro_sync_logs
    const syncLogsCol = new Collection({
      name: 'segundo_cerebro_sync_logs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'user_id', type: 'text', required: true },
        { name: 'user_name', type: 'text' },
        { name: 'source_type', type: 'select', values: ['file', 'zip'], maxSelect: 1 },
        { name: 'file_name', type: 'text' },
        { name: 'total_files', type: 'number' },
        { name: 'added_files', type: 'number' },
        { name: 'updated_files', type: 'number' },
        { name: 'unchanged_files', type: 'number' },
        { name: 'deleted_files', type: 'number' },
        { name: 'errors', type: 'json' }, // string[]
        { name: 'status', type: 'select', values: ['sucesso', 'parcial', 'erro'], maxSelect: 1 },
        { name: 'summary', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_sync_status ON segundo_cerebro_sync_logs (status)',
        'CREATE INDEX idx_sc_sync_created ON segundo_cerebro_sync_logs (created DESC)',
      ],
    })
    app.save(syncLogsCol)

    // 6. Conversas do Assistente: segundo_cerebro_chats
    const chatsCol = new Collection({
      name: 'segundo_cerebro_chats',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && @request.body.user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'conversation_id', type: 'text' }, // ID interno do agente de IA Skip Cloud
        { name: 'mode', type: 'select', values: ['geral', 'conselheiro', 'projeto'], maxSelect: 1 },
        { name: 'subject_or_project', type: 'text' },
        { name: 'is_favorite', type: 'bool' },
        { name: 'last_message', type: 'text' },
        { name: 'message_count', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_chats_user ON segundo_cerebro_chats (user_id, created DESC)',
        'CREATE INDEX idx_sc_chats_fav ON segundo_cerebro_chats (user_id, is_favorite)',
      ],
    })
    app.save(chatsCol)

    // 7. Mensagens do Assistente: segundo_cerebro_messages
    const messagesCol = new Collection({
      name: 'segundo_cerebro_messages',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && @request.body.user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'chat_id',
          type: 'relation',
          required: true,
          collectionId: chatsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          values: ['user', 'assistant'],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'citations', type: 'json' }, // [{ id, title, path, excerpt }]
        { name: 'is_favorite', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_sc_msgs_chat ON segundo_cerebro_messages (chat_id, created)',
        'CREATE INDEX idx_sc_msgs_user ON segundo_cerebro_messages (user_id)',
      ],
    })
    app.save(messagesCol)

    // 8. Definição do Agente de IA Nativo: segundo-cerebro
    $ai.agents.define(app, {
      slug: 'segundo-cerebro',
      name: 'Segundo Cérebro da Empresa',
      description:
        'Central de Inteligência e Memória Corporativa do ERP Jetro. Consulta e correlaciona a base documental autorizada do usuário com dados operacionais do ERP, atuando como assistente executivo e conselheiro estratégico.',
      systemPrompt:
        'Você é o assistente oficial do módulo "Segundo Cérebro da Empresa" do ERP Jetro — a Central de Inteligência e Memória Corporativa da organização.\n\n' +
        'MISSÃO:\n' +
        'Ajudar executivos, gestores e equipes a transformar o conhecimento documentado da empresa (reuniões, projetos, processos, decisões, normas, políticas e notas Obsidian) e os indicadores do ERP em decisões estratégicas assertivas.\n\n' +
        'DIRETRIZES FUNDAMENTAIS DE COMPORTAMENTO:\n' +
        '1. RESPOSTAS BASEADAS EXCLUSIVAMENTE EM DOCUMENTOS AUTORIZADOS: Utilize SOMENTE os documentos, decisões e dados presentes nas coleções autorizadas. NUNCA invente, presuma, extrapole ou deduza documentos inexistentes, decisões que não foram tomadas ou resultados fictícios.\n' +
        '2. CITAR FONTES OBRIGATORIAMENTE: Toda afirmação relevante DEVE citar explicitamente sua fonte documental (ex: "[Fonte: Diretriz Comercial 2026, nota #12]", "[Fonte: Ata de Reunião de Diretoria 10/02/2026]"). Se uma informação não constar em nenhum documento, declare categoricamente que a informação não foi encontrada na base de conhecimento.\n' +
        '3. DISTINÇÃO CLARA ENTRE ROTULAGEM DE INFORMAÇÕES: Sempre que apropriado ou solicitado, rotule com clareza:\n' +
        '   - [DADO OPERACIONAL DO ERP]: para informações oriundas de vendas, pedidos, estoque, financeiro.\n' +
        '   - [INFORMAÇÃO DOCUMENTADA]: para fatos, diretrizes e decisões extraídas de notas e políticas.\n' +
        '   - [INTERPRETAÇÃO DA IA / HIPÓTESE / SUGESTÃO]: para análises, riscos inferidos ou recomendações de ação.\n' +
        '4. PAPEL DE CONSELHEIRO ESTRATÉGICO: Ao avaliar ideias, problemas ou decisões (ex: substituição de sistemas, novos processos, expansão), estruture sua análise em:\n' +
        '   - Contexto e Histórico Documentado\n' +
        '   - Decisões Anteriores Relacionadas\n' +
        '   - Benefícios Esperados\n' +
        '   - Riscos Identificados\n' +
        '   - Impactos Operacionais e Financeiros\n' +
        '   - Departamentos Envolvidos e Dependências Técnicas\n' +
        '   - Alternativas Possíveis\n' +
        '   - Recomendações e Próximos Passos (distinguindo fatos documentados de sugestões)\n' +
        '5. SOMENTE LEITURA E APOIO: Você NUNCA decide, aprova nem executa alterações em dados do ERP ou em documentos. Você é estritamente uma ferramenta de suporte à decisão humana.\n' +
        '6. PERMISSÕES E CONFIDENCIALIDADE: Respeite as permissões do usuário informadas no contexto. Documentos com classificação "Estratégico" ou "Confidencial" só podem ser citados se o contexto indicar que o usuário possui autorização expressa.',
      tier: 'fast',
      tools: [
        { collection: 'segundo_cerebro_docs', perms: { list: true, read: true } },
        { collection: 'segundo_cerebro_decisions', perms: { list: true, read: true } },
        { collection: 'segundo_cerebro_opportunities', perms: { list: true, read: true } },
        { collection: 'segundo_cerebro_insights', perms: { list: true, read: true } },
        { collection: 'sales_orders', perms: { list: true, read: true } },
        { collection: 'financial_receivables', perms: { list: true, read: true } },
        { collection: 'products', perms: { list: true, read: true } },
        { collection: 'partners', perms: { list: true, read: true } },
        { collection: 'empresas', perms: { list: true, read: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text:
              'O Segundo Cérebro da Empresa é a Central de Inteligência e Memória Corporativa do Jetro ERP. ' +
              'Ele conecta a base de conhecimento (notas Obsidian importadas, atas de reuniões, políticas, projetos, processos e normas) ' +
              'aos dados reais operacionais do ERP (pedidos de venda, títulos financeiros, clientes, catálogo de produtos). ' +
              'Todas as respostas devem citar fontes de forma rigorosa e transparente, sem nunca simular dados.',
          },
        },
        {
          type: 'faq',
          payload: {
            qa: [
              {
                question: 'Como o Segundo Cérebro cita as fontes?',
                answer:
                  'Toda resposta menciona o título do documento de origem, caminho e data da nota ou ata, distinguindo fatos documentados de interpretações da IA.',
              },
              {
                question: 'O Segundo Cérebro pode alterar dados do ERP ou notas?',
                answer:
                  'Não. O agente opera estritamente em modo de leitura e análise consultiva, nunca executando operações de gravação, alteração ou exclusão.',
              },
            ],
          },
        },
      ],
    })

    console.log('0189_create_segundo_cerebro_collections applied successfully')
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'segundo-cerebro')
    } catch (_) {}
    const toDelete = [
      'segundo_cerebro_messages',
      'segundo_cerebro_chats',
      'segundo_cerebro_sync_logs',
      'segundo_cerebro_insights',
      'segundo_cerebro_opportunities',
      'segundo_cerebro_decisions',
      'segundo_cerebro_docs',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        if (col) app.delete(col)
      } catch (_) {}
    }
  },
)
