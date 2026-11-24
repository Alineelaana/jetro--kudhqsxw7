// 0332: Cadastra a empresa "GR INDÚSTRIA ES - FILIAL 11" (GR INDUSTRIA DE ALIMENTOS LTDA),
// última filial do grupo Gran Romano (Colatina/ES), a partir do Comprovante de Inscrição
// CNPJ da Receita + Contrato Social enviados pelo usuário (CNPJ 33.516.806/0001-96,
// abertura 03/05/2019, situação ATIVA, IE 83563245).
//
// ATENÇÃO — este CNPJ é a RAIZ do grupo: o registro matriz Gran Romano do sistema
// (code GRAN-ROMANO) emite NF-e com cnpj_emitente 33516806000196 e IE 083563245.
// Por isso a migração tem dois ramos, no padrão idempotente das 0328/0330/0331:
//  1) Se JÁ EXISTIR registro com esse CNPJ (pontuado ou não), código ou nome:
//     NÃO cria duplicado — atualiza APENAS marca_nome_exibicao para
//     "GR INDÚSTRIA ES - FILIAL 11" (e a IE para 83563245 apenas se estiver vazia).
//     Razão social, cores, vínculos e demais campos ficam intocados.
//  2) Se NÃO existir: cria a filial nova herdando as cores da marca da matriz
//     Gran Romano, com matriz_id apontando para ela e logomarca via fallback
//     front-end (use-brand.tsx reconhece o grupo pelo código GR-*).
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
      console.log('0332: falha ao localizar matriz Gran Romano:', eMatriz)
    }

    // Localiza registro existente com o mesmo CNPJ (raiz 33516806, pontuado ou não),
    // mesmo código ou mesmo nome de exibição — cobre tanto a matriz (CNPJ igual ao
    // da raiz) quanto um eventual registro de filial já criado por outra via
    var existing = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "33516806000196" || cnpj = "33.516.806/0001-96" || code = "GR-FILIAL-11" || marca_nome_exibicao = "GR INDÚSTRIA ES - FILIAL 11"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        existing = found[0]
      }
    } catch (eFind) {
      console.log('0332: falha ao buscar registro existente:', eFind)
    }

    // RAMO 1 — registro já existe (caso real: o CNPJ é o da matriz GRAN-ROMANO):
    // atualiza SOMENTE o nome de exibição no trocador de empresas e, se vazia, a IE.
    // Nada mais é tocado (nem razão social, nem cores, nem vínculo, nem config fiscal).
    if (existing) {
      existing.set('marca_nome_exibicao', 'GR INDÚSTRIA ES - FILIAL 11')
      if (!(existing.getString('inscricao_estadual') || '')) {
        existing.set('inscricao_estadual', '83563245')
      }
      app.save(existing)
      console.log(
        '0332: registro já existia com o CNPJ 33516806000196 (id ' +
          existing.id +
          ', code ' +
          existing.getString('code') +
          ') — atualizado APENAS marca_nome_exibicao para "GR INDÚSTRIA ES - FILIAL 11"; nenhum registro novo criado',
      )
      return
    }

    // RAMO 2 — não existe registro com esse CNPJ: cria a filial nova no padrão 0330
    var rec = new Record(empCol)
    rec.set('code', 'GR-FILIAL-11')
    rec.set('name', 'GR INDÚSTRIA ES - FILIAL 11')
    rec.set('razao_social', 'GR INDUSTRIA DE ALIMENTOS LTDA')
    rec.set('nome_fantasia', 'GRAN ROMANO')
    rec.set('cnpj', '33516806000196')
    rec.set('inscricao_estadual', '83563245')
    rec.set('address', 'ESVC AS MARGENS DA ES 357, S/N - KM 67 PARTE A - BAUNILHA')
    rec.set('city', 'COLATINA')
    rec.set('state', 'ES')
    rec.set('cep', '29715000')
    rec.set('phone', '(11) 3569-1665')
    rec.set('email', 'FINANCEIRO@GRANROMANO.COM.BR')
    rec.set('active', true)
    rec.set('tipo_unidade', 'Filial')
    rec.set('responsavel_legal', matriz ? matriz.getString('responsavel_legal') || '' : '')

    // Identidade visual herdada da Gran Romano (mesmas cores da marca da matriz).
    // A logomarca do grupo Gran Romano não é arquivo nesta coleção: vem do fallback
    // oficial do front-end (use-brand.tsx), que já reconhece o grupo pelo código GR-*
    // e pelo nome fantasia GRAN ROMANO.
    rec.set('marca_nome_exibicao', 'GR INDÚSTRIA ES - FILIAL 11')
    rec.set('marca_cor_primaria', matriz ? matriz.getString('marca_cor_primaria') || '' : '')
    rec.set('marca_cor_secundaria', matriz ? matriz.getString('marca_cor_secundaria') || '' : '')
    rec.set(
      'marca_cor_complementar',
      matriz ? matriz.getString('marca_cor_complementar') || '' : '',
    )
    rec.set('padrao', false)

    // Vínculo com a matriz (mesmo padrão da correção 0329 — gravado aqui direto)
    if (matriz) {
      rec.set('matriz_id', matriz.id)
    }

    rec.set('responsible_user', 'Admin')

    app.save(rec)
    console.log('0332: empresa GR INDÚSTRIA ES - FILIAL 11 criada (id ' + rec.id + ')')
  },
  (app) => {
    // Reversão: remove o registro da filial apenas se ele foi criado por esta migração
    // (ramo 2). No ramo 1 (registro preexistente) nada é removido — a reversão apenas
    // não desfaz o rename de marca_nome_exibicao, que é operação sobre registro prévio.
    try {
      var recs = app.findRecordsByFilter('empresas', 'code = "GR-FILIAL-11"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        app.delete(recs[i])
      }
    } catch (eDown) {
      console.log('0332 down: ', eDown)
    }
  },
)
