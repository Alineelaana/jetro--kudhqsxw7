// 0334: Cadastra a empresa "ELDORADO FILIAL - 45.143.101/0003-11"
// (ELDORADO DISTRIBUICAO DE BENS DE CONSUMO E DE HIGIENE PESSOAL LTDA.), filial
// da Dec Eldorado em Serra/ES, a partir do Comprovante de Inscrição CNPJ da
// Receita enviado pelo usuário (CNPJ 45.143.101/0003-11, abertura 10/03/2023,
// situação ATIVA). NÃO é do grupo Gran Romano. Segue o MESMO padrão
// condicional das migrações 0328/0330/0332/0333, com dois ramos:
//  1) Se JÁ EXISTIR registro com esse CNPJ (pontuado, não pontuado) ou mesmo
//     código/nome de exibição: NÃO cria duplicado — apenas garante
//     marca_nome_exibicao = "ELDORADO FILIAL - 45.143.101/0003-11" e vínculo de
//     matriz. Importante: a busca NÃO usa a raiz "45143101" sem qualificador,
//     pois matriz e filial compartilham a mesma raiz — filtrar só pela raiz
//     traria a ELDORADO MATRIZ e bloquearia a criação da filial. A raiz é
//     usada apenas para EXCLUIR a matriz da verificação de duplicidade.
//  2) Se NÃO existir: cria a empresa Filial, ativa, com as MESMAS cores
//     azuis/douradas da ELDORADO MATRIZ (#003DA5 / #D4AF37 / #F5B324) e
//     matriz_id apontando para ela. IE fica VAZIA (a filial é isenta — não
//     possui Inscrição Estadual; a coleção empresas não tem campo indicador de
//     isenção — documentado na Lógica da Tela de /admin/cadastros/empresas).
//     Logomarca via fallback oficial do front-end (use-brand.tsx reconhece
//     códigos DEC-* da Eldorado). SEM config fiscal Focus NFe (mesma regra das
//     demais filiais — criar na tela fiscal quando for emitir NF).
// Idempotente: reexecutar não cria duplicado e nada muda se o registro já
// estiver com o nome de exibição e vínculo corretos.
migrate(
  (app) => {
    var empCol = app.findCollectionByNameOrId('empresas')

    // Localiza a matriz Eldorado para copiar as cores e vincular como matriz
    var matriz = null
    try {
      var matrizFound = app.findRecordsByFilter(
        'empresas',
        'code = "DEC-ELDORADO" || cnpj = "45143101000150" || cnpj = "45.143.101/0001-50"',
        '',
        1,
        0,
      )
      if (matrizFound && matrizFound.length > 0) {
        matriz = matrizFound[0]
      }
    } catch (eMatriz) {
      console.log('0334: falha ao localizar matriz Eldorado:', eMatriz)
    }

    // RAMO 1 — busca por CNPJ da filial (pontuado e não pontuado), código ou
    // nome de exibição. DELIBERADAMENTE sem "cnpj ~ raiz": a raiz 45143101 é
    // compartilhada com a matriz e traria o registro dela para cá.
    var existing = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "45143101000311" || cnpj = "45.143.101/0003-11" || code = "DEC-FILIAL-03" || marca_nome_exibicao = "ELDORADO FILIAL - 45.143.101/0003-11"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        existing = found[0]
      }
    } catch (eFind) {
      console.log('0334: falha ao buscar registro existente:', eFind)
    }

    var rec = existing
    if (!rec) {
      rec = new Record(empCol)
    }

    if (!(rec.getString('code') || '')) {
      rec.set('code', 'DEC-FILIAL-03')
    }
    rec.set('name', 'ELDORADO FILIAL - 45.143.101/0003-11')
    rec.set('razao_social', 'ELDORADO DISTRIBUICAO DE BENS DE CONSUMO E DE HIGIENE PESSOAL LTDA')
    rec.set('nome_fantasia', 'Dec Eldorado')
    rec.set('cnpj', '45143101000311')
    rec.set('inscricao_estadual', existing ? existing.getString('inscricao_estadual') || '' : '')
    rec.set('address', 'Avenida Porto Canoa, S/N — Lote A3C2 Modulo 1 e 2 Sala 04, Porto Canoa')
    rec.set('city', 'Serra')
    rec.set('state', 'ES')
    rec.set('cep', '29168345')
    rec.set('email', 'contato@deceldorado.com.br')
    rec.set('phone', '(27) 3300-1821')
    rec.set('active', true)
    rec.set('tipo_unidade', 'Filial')

    // Identidade visual da Eldorado (mesma paleta azul/dourada da matriz).
    // A logomarca da Eldorado não é arquivo nesta coleção: vem do fallback
    // oficial do front-end (use-brand.tsx), que reconhece a marca pelo código
    // DEC-* da empresa.
    rec.set('marca_nome_exibicao', 'ELDORADO FILIAL - 45.143.101/0003-11')
    rec.set('marca_cor_primaria', matriz ? matriz.getString('marca_cor_primaria') || '' : '#003DA5')
    rec.set(
      'marca_cor_secundaria',
      matriz ? matriz.getString('marca_cor_secundaria') || '' : '#D4AF37',
    )
    rec.set(
      'marca_cor_complementar',
      matriz ? matriz.getString('marca_cor_complementar') || '' : '#F5B324',
    )
    rec.set('padrao', false)

    // Vínculo com a matriz (mesmo padrão da 0329/0330 — gravado aqui direto)
    if (matriz && !(rec.getString('matriz_id') || '')) {
      rec.set('matriz_id', matriz.id)
    }

    if (!existing) {
      rec.set('responsible_user', 'Admin')
    }

    app.save(rec)
    console.log(
      existing
        ? '0334: empresa ELDORADO FILIAL - 45.143.101/0003-11 atualizada (id ' +
            rec.id +
            ') — nenhum registro novo criado'
        : '0334: empresa ELDORADO FILIAL - 45.143.101/0003-11 criada (id ' + rec.id + ')',
    )
  },
  (app) => {
    // Reversão: remove o registro da filial apenas se ele foi criado por esta
    // migração (código DEC-FILIAL-03). Não toca na matriz.
    try {
      var recs = app.findRecordsByFilter('empresas', 'code = "DEC-FILIAL-03"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        app.delete(recs[i])
      }
    } catch (eDown) {
      console.log('0334 down: ', eDown)
    }
  },
)
