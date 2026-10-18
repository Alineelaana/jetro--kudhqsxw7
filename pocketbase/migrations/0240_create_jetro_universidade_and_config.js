/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Coleção: jetro_universidade_videos (Universidade Jetro - Treinamentos em Vídeo)
    let colVideos = null
    try {
      colVideos = app.findCollectionByNameOrId('jetro_universidade_videos')
    } catch (_) {}

    if (!colVideos) {
      colVideos = new Collection({
        name: 'jetro_universidade_videos',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'titulo', type: 'text', required: true },
          { name: 'youtube_url', type: 'text', required: true },
          { name: 'youtube_id', type: 'text' },
          { name: 'descricao', type: 'text' },
          { name: 'modulo', type: 'text', required: true },
          { name: 'assunto', type: 'text' },
          { name: 'palavras_chave', type: 'text' },
          { name: 'rota_relacionada', type: 'text' },
          { name: 'permissao_necessaria', type: 'text' },
          { name: 'ordem', type: 'number' },
          { name: 'ativo', type: 'bool' },
          { name: 'visualizacoes', type: 'number' },
          { name: 'recomendacoes_count', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_juv_modulo ON jetro_universidade_videos (modulo)',
          'CREATE INDEX idx_juv_ativo ON jetro_universidade_videos (ativo)',
          'CREATE INDEX idx_juv_ordem ON jetro_universidade_videos (ordem)',
        ],
      })
      app.save(colVideos)
    }

    // 2. Coleção: jetro_online_config (Configurações Gerais e Recursos do Assistente)
    let colConfig = null
    try {
      colConfig = app.findCollectionByNameOrId('jetro_online_config')
    } catch (_) {}

    if (!colConfig) {
      colConfig = new Collection({
        name: 'jetro_online_config',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'chave', type: 'text', required: true },
          { name: 'titulo_assistente', type: 'text' },
          { name: 'saudacao_principal', type: 'text' },
          { name: 'texto_auxiliar', type: 'text' },
          { name: 'mensagem_boas_vindas', type: 'text' },
          { name: 'mensagem_indisponibilidade', type: 'text' },
          { name: 'permitir_anexos', type: 'bool' },
          { name: 'permitir_voz', type: 'bool' },
          { name: 'botao_video_ativo', type: 'bool' },
          { name: 'botao_tour_ativo', type: 'bool' },
          { name: 'recomendar_universidade_auto', type: 'bool' },
          { name: 'max_recomendacoes_video', type: 'number' },
          { name: 'placeholder_input', type: 'text' },
          { name: 'tema_cor_primaria', type: 'text' },
          { name: 'tema_cor_destaque', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE UNIQUE INDEX idx_joc_chave ON jetro_online_config (chave)'],
      })
      app.save(colConfig)
    }

    // 3. Coleção: jetro_online_sugestoes (Sugestões Inteligentes - Cards / Pills)
    let colSugestoes = null
    try {
      colSugestoes = app.findCollectionByNameOrId('jetro_online_sugestoes')
    } catch (_) {}

    if (!colSugestoes) {
      colSugestoes = new Collection({
        name: 'jetro_online_sugestoes',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'texto', type: 'text', required: true },
          { name: 'descricao', type: 'text' },
          { name: 'modulo', type: 'text' },
          { name: 'permissao_necessaria', type: 'text' },
          { name: 'ordem', type: 'number' },
          { name: 'ativo', type: 'bool' },
          { name: 'cliques_count', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_jos_ordem ON jetro_online_sugestoes (ordem)',
          'CREATE INDEX idx_jos_ativo ON jetro_online_sugestoes (ativo)',
        ],
      })
      app.save(colSugestoes)
    }

    // 4. Coleção: jetro_online_perguntas (Registro auditado de Perguntas dos Usuários)
    let colPerguntas = null
    try {
      colPerguntas = app.findCollectionByNameOrId('jetro_online_perguntas')
    } catch (_) {}

    if (!colPerguntas) {
      colPerguntas = new Collection({
        name: 'jetro_online_perguntas',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule: '@request.auth.id != ""',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'user_id', type: 'text', required: true },
          { name: 'user_name', type: 'text' },
          { name: 'user_role', type: 'text' },
          { name: 'pergunta', type: 'text', required: true },
          { name: 'resposta_resumo', type: 'text' },
          { name: 'modulo', type: 'text' },
          { name: 'rota_origem', type: 'text' },
          {
            name: 'status_resposta',
            type: 'select',
            required: true,
            values: ['sucesso', 'sem_resposta', 'erro', 'acesso_restrito'],
            maxSelect: 1,
          },
          { name: 'conversation_id', type: 'text' },
          { name: 'video_recomendado_id', type: 'text' },
          { name: 'video_recomendado_titulo', type: 'text' },
          { name: 'avaliacao', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_jop_user_id ON jetro_online_perguntas (user_id)',
          'CREATE INDEX idx_jop_status ON jetro_online_perguntas (status_resposta)',
          'CREATE INDEX idx_jop_modulo ON jetro_online_perguntas (modulo)',
          'CREATE INDEX idx_jop_created ON jetro_online_perguntas (created)',
        ],
      })
      app.save(colPerguntas)
    }

    // 5. Coleção: jetro_tours (Tours Guiados por Módulo / Tela)
    let colTours = null
    try {
      colTours = app.findCollectionByNameOrId('jetro_tours')
    } catch (_) {}

    if (!colTours) {
      colTours = new Collection({
        name: 'jetro_tours',
        type: 'base',
        listRule: '@request.auth.id != ""',
        viewRule: '@request.auth.id != ""',
        createRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'titulo', type: 'text', required: true },
          { name: 'descricao', type: 'text' },
          { name: 'rota', type: 'text', required: true },
          { name: 'modulo', type: 'text' },
          { name: 'etapas', type: 'json' },
          { name: 'ativo', type: 'bool' },
          { name: 'ordem', type: 'number' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_jt_rota ON jetro_tours (rota)',
          'CREATE INDEX idx_jt_ativo ON jetro_tours (ativo)',
        ],
      })
      app.save(colTours)
    }
  },
  (app) => {
    try {
      const t = app.findCollectionByNameOrId('jetro_tours')
      if (t) app.delete(t)
    } catch (_) {}
    try {
      const p = app.findCollectionByNameOrId('jetro_online_perguntas')
      if (p) app.delete(p)
    } catch (_) {}
    try {
      const s = app.findCollectionByNameOrId('jetro_online_sugestoes')
      if (s) app.delete(s)
    } catch (_) {}
    try {
      const c = app.findCollectionByNameOrId('jetro_online_config')
      if (c) app.delete(c)
    } catch (_) {}
    try {
      const v = app.findCollectionByNameOrId('jetro_universidade_videos')
      if (v) app.delete(v)
    } catch (_) {}
  },
)
