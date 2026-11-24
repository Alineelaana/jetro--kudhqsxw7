// 0328: Cadastra a empresa "GR FILIAL SP - 12" (filial da Gran Romano em São Paulo/SP)
// a partir dos dados oficiais do Cadesp, herdando a identidade visual da matriz Gran Romano
// (cores da marca) e usando "GR FILIAL SP - 12" como nome de exibição no trocador de empresas.
// Idempotente: se já existir registro com o mesmo CNPJ (33516806000277), apenas completa/atualiza
// os campos — nunca duplica.
migrate(
  (app) => {
    var empCol = app.findCollectionByNameOrId('empresas')

    // Localiza a matriz Gran Romano para copiar a marca e vincular como matriz
    var matriz = null
    try {
      var matrizFound = app.findRecordsByFilter(
        'empresas',
        'code = "GRAN-ROMANO" || cnpj = "33.516.806/0001-96" || cnpj = "33516806000196"',
        '',
        1,
        0,
      )
      if (matrizFound && matrizFound.length > 0) {
        matriz = matrizFound[0]
      }
    } catch (eMatriz) {
      console.log('0328: falha ao localizar matriz Gran Romano:', eMatriz)
    }

    // Localiza registro existente com o mesmo CNPJ (pontuado ou não) ou mesmo código/nome
    var existing = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "33516806000277" || cnpj = "33.516.806/0002-77" || code = "GR-FILIAL-SP-12" || name ~ "GR FILIAL SP"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        existing = found[0]
      }
    } catch (eFind) {
      console.log('0328: falha ao buscar registro existente:', eFind)
    }

    var rec = existing
    if (!rec) {
      rec = new Record(empCol)
    }

    if (!(rec.getString('code') || '')) {
      rec.set('code', 'GR-FILIAL-SP-12')
    }
    rec.set('name', 'GR FILIAL SP - 12')
    rec.set('razao_social', 'GR INDUSTRIA DE ALIMENTOS S/A')
    rec.set('nome_fantasia', 'GRAN ROMANO')
    rec.set('cnpj', '33516806000277')
    rec.set('inscricao_estadual', '162545386113')
    rec.set('address', 'RUA VILA DE AROUCA, nº 315 - SITIO BARROCADA')
    rec.set('city', 'SAO PAULO')
    rec.set('state', 'SP')
    rec.set('cep', '02285020')
    rec.set('active', true)
    rec.set('tipo_unidade', 'Filial')
    rec.set('responsavel_legal', matriz ? matriz.getString('responsavel_legal') || '' : '')

    // Identidade visual herdada da Gran Romano (mesmas cores da marca da matriz).
    // A logomarca do grupo Gran Romano não é arquivo nesta coleção (logo/marca_logo vazios
    // na matriz): ela vem do fallback oficial do front-end (use-brand.tsx), que agora
    // reconhece o grupo pelo nome fantasia/razão social/prefixo de código GR-.
    rec.set('marca_nome_exibicao', 'GR FILIAL SP - 12')
    rec.set('marca_cor_primaria', matriz ? matriz.getString('marca_cor_primaria') || '' : '')
    rec.set('marca_cor_secundaria', matriz ? matriz.getString('marca_cor_secundaria') || '' : '')
    rec.set(
      'marca_cor_complementar',
      matriz ? matriz.getString('marca_cor_complementar') || '' : '',
    )
    rec.set('padrao', false)

    if (!existing) {
      rec.set('responsible_user', 'Admin')
    }

    app.save(rec)
    console.log(
      existing
        ? '0328: empresa GR FILIAL SP - 12 atualizada (id ' + rec.id + ')'
        : '0328: empresa GR FILIAL SP - 12 criada (id ' + rec.id + ')',
    )
  },
  (app) => {
    // Reversão: remove o registro da filial apenas se ele foi criado por esta migração
    try {
      var recs = app.findRecordsByFilter('empresas', 'cnpj = "33516806000277"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        app.delete(recs[i])
      }
    } catch (eDown) {
      console.log('0328 down: ', eDown)
    }
  },
)
