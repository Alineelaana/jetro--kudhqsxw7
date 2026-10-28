migrate(
  (app) => {
    // Regra RLS com suporte multiempresa conforme padrão do projeto
    var ruleEmpresa =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa = @request.auth.empresa_id || (empresa = '' && @request.auth.empresa_id = ''))"
    var ruleEmpresaWrite =
      "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso = 'SUP' || empresa = @request.auth.empresa_id || empresa = '')"

    // 1. Coleção: cnab_configs (Convênios bancários por empresa/filial)
    var cnabConfigs = new Collection({
      name: 'cnab_configs',
      type: 'base',
      listRule: ruleEmpresa,
      viewRule: ruleEmpresa,
      createRule: ruleEmpresaWrite,
      updateRule: ruleEmpresaWrite,
      deleteRule: ruleEmpresaWrite,
      fields: [
        { name: 'nome_convenio', type: 'text', required: true },
        { name: 'banco_codigo', type: 'text', required: true }, // ex: 001, 237, 341, 104, 033, 748, 756
        { name: 'banco_nome', type: 'text', required: true },
        { name: 'layout_padrao', type: 'select', required: true, values: ['CNAB 240', 'CNAB 400'] },
        { name: 'ambiente', type: 'select', required: true, values: ['homologacao', 'producao'] },
        {
          name: 'tipo_cobranca',
          type: 'select',
          required: true,
          values: ['boleto', 'pix', 'ambos'],
        },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'empresa_id', type: 'text' },
        { name: 'filial_id', type: 'text' },
        { name: 'agencia', type: 'text', required: true },
        { name: 'agencia_digito', type: 'text' },
        { name: 'conta', type: 'text', required: true },
        { name: 'conta_digito', type: 'text', required: true },
        { name: 'convenio', type: 'text', required: true },
        { name: 'cedente_nome', type: 'text', required: true },
        { name: 'cedente_codigo', type: 'text', required: true },
        { name: 'cedente_cnpj_cpf', type: 'text' },
        { name: 'carteira', type: 'text', required: true },
        { name: 'variacao_carteira', type: 'text' },
        { name: 'chave_pix', type: 'text' },
        { name: 'sequencial_remessa', type: 'number', required: false },
        { name: 'multa_percentual', type: 'text' }, // ex: 2.00
        { name: 'juros_mora_mensal', type: 'text' }, // ex: 1.00
        { name: 'dias_baixa_devolucao', type: 'number' }, // ex: 29
        { name: 'dias_protesto', type: 'number' },
        { name: 'instrucoes_cobranca_1', type: 'text' },
        { name: 'instrucoes_cobranca_2', type: 'text' },
        { name: 'ativo', type: 'bool' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cnabConfigs)

    // 2. Coleção: cnab_remessas (Lotes de remessa gerados)
    var cnabRemessas = new Collection({
      name: 'cnab_remessas',
      type: 'base',
      listRule: ruleEmpresa,
      viewRule: ruleEmpresa,
      createRule: ruleEmpresaWrite,
      updateRule: ruleEmpresaWrite,
      deleteRule: ruleEmpresaWrite,
      fields: [
        { name: 'config_id', type: 'text', required: true },
        { name: 'banco_codigo', type: 'text', required: true },
        { name: 'layout', type: 'select', required: true, values: ['CNAB 240', 'CNAB 400'] },
        { name: 'sequencial_arquivo', type: 'number', required: true },
        { name: 'nome_arquivo', type: 'text', required: true },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'usuario_nome', type: 'text' },
        { name: 'usuario_id', type: 'text' },
        { name: 'data_geracao', type: 'text', required: true },
        { name: 'quantidade_titulos', type: 'number', required: true },
        { name: 'valor_total', type: 'text', required: true },
        { name: 'titulos_ids', type: 'json' }, // lista dos IDs de financial_receivables / financial_payables
        { name: 'titulos_detalhes', type: 'json' }, // snapshot dos títulos no momento da remessa
        { name: 'checksum_conteudo', type: 'text' }, // hash sha256 simples do arquivo
        { name: 'conteudo_arquivo', type: 'text' }, // texto completo .REM gerado
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['gerado', 'enviado_ao_banco', 'processado', 'cancelado'],
        },
        { name: 'motivo_cancelamento', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cnabRemessas)

    // 3. Coleção: cnab_retornos (Arquivos de retorno processados e auditoria)
    var cnabRetornos = new Collection({
      name: 'cnab_retornos',
      type: 'base',
      listRule: ruleEmpresa,
      viewRule: ruleEmpresa,
      createRule: ruleEmpresaWrite,
      updateRule: ruleEmpresaWrite,
      deleteRule: ruleEmpresaWrite,
      fields: [
        { name: 'nome_arquivo', type: 'text', required: true },
        { name: 'layout', type: 'select', required: true, values: ['CNAB 240', 'CNAB 400'] },
        { name: 'banco_codigo', type: 'text' },
        { name: 'banco_nome', type: 'text' },
        { name: 'empresa', type: 'text' },
        { name: 'filial', type: 'text' },
        { name: 'data_processamento', type: 'text', required: true },
        { name: 'data_gravacao_retorno', type: 'text' },
        { name: 'usuario_nome', type: 'text' },
        { name: 'usuario_id', type: 'text' },
        { name: 'total_registros', type: 'number' },
        { name: 'total_titulos_processados', type: 'number' },
        { name: 'total_valor_processado', type: 'text' },
        { name: 'total_valor_liquidado', type: 'text' },
        { name: 'total_liquidados', type: 'number' },
        { name: 'total_divergencias', type: 'number' },
        { name: 'total_rejeicoes', type: 'number' },
        { name: 'total_baixas', type: 'number' },
        { name: 'eventos', type: 'json' }, // array estruturado de ocorrências decodificadas
        { name: 'checksum_conteudo', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['processado_com_sucesso', 'processado_com_pendencias', 'erro_processamento'],
        },
        { name: 'log_processamento', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cnabRetornos)
  },
  (app) => {
    try {
      var col3 = app.findCollectionByNameOrId('cnab_retornos')
      if (col3) app.delete(col3)
    } catch (_) {}
    try {
      var col2 = app.findCollectionByNameOrId('cnab_remessas')
      if (col2) app.delete(col2)
    } catch (_) {}
    try {
      var col1 = app.findCollectionByNameOrId('cnab_configs')
      if (col1) app.delete(col1)
    } catch (_) {}
  },
)
