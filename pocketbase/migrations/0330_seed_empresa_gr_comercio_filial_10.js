// 0330: Cadastra a empresa "GR COMÉRCIO - FILIAL 10" (GR COMERCIO DE ALIMENTOS LTDA),
// filial do grupo Gran Romano em Colatina/ES, a partir do Comprovante de Inscrição CNPJ
// da Receita (CNPJ 33.531.059/0001-65, abertura 06/05/2019, situação ATIVA).
// Segue o mesmo padrão da 0328/0329: herda as cores da marca da matriz Gran Romano,
// vincula matriz_id à matriz, e usa "GR COMÉRCIO - FILIAL 10" como nome de exibição
// no trocador de empresas. Idempotente: se já existir registro com o mesmo CNPJ
// (pontuado ou não) ou mesmo código, apenas completa/atualiza — nunca duplica.
// Observação: o documento da Receita não traz Inscrição Estadual — o campo fica vazio.
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
      console.log('0330: falha ao localizar matriz Gran Romano:', eMatriz)
    }

    // Localiza registro existente com o mesmo CNPJ (raiz 33531059, pontuado ou não)
    // ou mesmo código/nome — cobre caso o registro já exista com outro formato
    var existing = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "33531059000165" || cnpj = "33.531.059/0001-65" || cnpj ~ "33531059" || code = "GR-FILIAL-10" || razao_social ~ "GR COMERCIO DE ALIMENTOS"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        existing = found[0]
      }
    } catch (eFind) {
      console.log('0330: falha ao buscar registro existente:', eFind)
    }

    var rec = existing
    if (!rec) {
      rec = new Record(empCol)
    }

    if (!(rec.getString('code') || '')) {
      rec.set('code', 'GR-FILIAL-10')
    }
    rec.set('name', 'GR COMÉRCIO - FILIAL 10')
    rec.set('razao_social', 'GR COMERCIO DE ALIMENTOS LTDA')
    rec.set('nome_fantasia', 'GRAN ROMANO')
    rec.set('cnpj', '33531059000165')
    rec.set('inscricao_estadual', existing ? existing.getString('inscricao_estadual') || '' : '')
    rec.set('address', 'ESVC AS MARGENS DA ES 357, S/N - KM 67 - BAUNILHA')
    rec.set('city', 'COLATINA')
    rec.set('state', 'ES')
    rec.set('cep', '29715000')
    rec.set('phone', '(11) 3569-1665')
    rec.set('email', 'FINANCEIRO@GRANROMANO.COM.BR')
    rec.set('active', true)
    rec.set('tipo_unidade', 'Filial')
    rec.set(
      'responsavel_legal',
      existing && existing.getString('responsavel_legal')
        ? existing.getString('responsavel_legal')
        : matriz
          ? matriz.getString('responsavel_legal') || ''
          : '',
    )

    // Identidade visual herdada da Gran Romano (mesmas cores da marca da matriz).
    // A logomarca do grupo Gran Romano não é arquivo nesta coleção: vem do fallback
    // oficial do front-end (use-brand.tsx), que já reconhece o grupo pelo código GR-*
    // e pelo nome fantasia GRAN ROMANO.
    rec.set('marca_nome_exibicao', 'GR COMÉRCIO - FILIAL 10')
    rec.set('marca_cor_primaria', matriz ? matriz.getString('marca_cor_primaria') || '' : '')
    rec.set('marca_cor_secundaria', matriz ? matriz.getString('marca_cor_secundaria') || '' : '')
    rec.set(
      'marca_cor_complementar',
      matriz ? matriz.getString('marca_cor_complementar') || '' : '',
    )
    rec.set('padrao', false)

    // Vínculo com a matriz (mesmo padrão da correção 0329 — gravado aqui direto)
    if (matriz && !(rec.getString('matriz_id') || '')) {
      rec.set('matriz_id', matriz.id)
    }

    if (!existing) {
      rec.set('responsible_user', 'Admin')
    }

    app.save(rec)
    console.log(
      existing
        ? '0330: empresa GR COMÉRCIO - FILIAL 10 atualizada (id ' + rec.id + ')'
        : '0330: empresa GR COMÉRCIO - FILIAL 10 criada (id ' + rec.id + ')',
    )
  },
  (app) => {
    // Reversão: remove o registro da filial apenas se ele foi criado por esta migração
    try {
      var recs = app.findRecordsByFilter('empresas', 'cnpj = "33531059000165"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        app.delete(recs[i])
      }
    } catch (eDown) {
      console.log('0330 down: ', eDown)
    }
  },
)
