// 0333: Empresa ELDORADO MATRIZ (Eldorado Distribuicao de Bens de Consumo e de
// Higiene Pessoal Ltda., CNPJ 45.143.101/0001-50), a partir do Comprovante de
// Inscrição CNPJ da Receita enviado pelo usuário. NÃO é do grupo Gran Romano.
//
// A Dec Eldorado é o primeiro cliente do sistema multitenant: a empresa já existe
// (code DEC-ELDORADO, criada pela seed 0279). A migração segue a MESMA regra
// condicional das 0328/0330/0331/0332, com dois ramos:
//  1) Se JÁ EXISTIR registro com esse CNPJ (pontuado, não pontuado ou raiz
//     45143101), código DEC-ELDORADO ou nome de exibição: NÃO cria duplicado —
//     atualiza APENAS marca_nome_exibicao para "ELDORADO MATRIZ" (e grava a IE
//     83862021 somente se o campo estiver vazio; IE diferente NÃO é sobrescrita).
//     Razão social, cores, vínculos, config fiscal e demais campos ficam intocados.
//  2) Se NÃO existir: cria a empresa Matriz, ativa, com cores próprias NEUTRAS
//     (#003DA5 azul / #D4AF37 dourado / #F5B324 âmbar), que NÃO são as cores do
//     grupo Gran Romano (#4A2E1B/#C69B45/#8B5A2B). Logomarca via fallback
//     oficial do front-end (use-brand.tsx reconhece DEC-ELDORADO).
migrate(
  (app) => {
    // RAMO 1 — busca por CNPJ (pontuado, não pontuado, raiz), código ou nome de exibição
    var existing = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "45143101000150" || cnpj = "45.143.101/0001-50" || cnpj ~ "45143101" || code = "DEC-ELDORADO" || marca_nome_exibicao = "ELDORADO MATRIZ"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        existing = found[0]
      }
    } catch (eFind) {
      console.log('0333: falha ao buscar registro existente:', eFind)
    }

    if (existing) {
      existing.set('marca_nome_exibicao', 'ELDORADO MATRIZ')
      var ieAtual = existing.getString('inscricao_estadual') || ''
      if (!ieAtual) {
        existing.set('inscricao_estadual', '83862021')
        console.log('0333: IE vazia — preenchida com 83862021')
      } else if (ieAtual !== '83862021') {
        console.log(
          '0333: IE atual (' +
            ieAtual +
            ') difere de 83862021 — NÃO sobrescrita; verificar com o usuário',
        )
      }
      app.save(existing)
      console.log(
        '0333: registro já existia com o CNPJ 45143101000150 (id ' +
          existing.id +
          ', code ' +
          existing.getString('code') +
          ') — atualizado APENAS marca_nome_exibicao para "ELDORADO MATRIZ"; nenhum registro novo criado',
      )
      return
    }

    // RAMO 2 — não existe registro com esse CNPJ: cria a empresa Matriz
    var empCol = app.findCollectionByNameOrId('empresas')
    var rec = new Record(empCol)
    rec.set('code', 'DEC-ELDORADO')
    rec.set('name', 'ELDORADO MATRIZ')
    rec.set('razao_social', 'Eldorado Distribuicao de Bens de Consumo e de Higiene Pessoal Ltda.')
    rec.set('nome_fantasia', 'Dec Eldorado')
    rec.set('cnpj', '45143101000150')
    rec.set('inscricao_estadual', '83862021')
    rec.set('address', 'Avenida Porto Canoa, S/N — Lote A3C2 Modulo 1 e 2 Sala 02')
    rec.set('city', 'Serra')
    rec.set('state', 'ES')
    rec.set('cep', '29168345')
    rec.set('active', true)
    rec.set('tipo_unidade', 'Matriz')
    rec.set('padrao', false)

    // Cores próprias NEUTRAS coerentes com o padrão da coleção (NÃO as do grupo
    // Gran Romano #4A2E1B/#C69B45/#8B5A2B): azul institucional #003DA5,
    // dourado #D4AF37 e âmbar #F5B324 — mesma paleta usada pelo shell para a
    // Eldorado antes deste cadastro (marca_cor_primaria/secundaria/complementar).
    rec.set('marca_nome_exibicao', 'ELDORADO MATRIZ')
    rec.set('marca_cor_primaria', '#003DA5')
    rec.set('marca_cor_secundaria', '#D4AF37')
    rec.set('marca_cor_complementar', '#F5B324')
    rec.set('responsible_user', 'Admin')

    app.save(rec)
    console.log('0333: empresa ELDORADO MATRIZ criada (id ' + rec.id + ')')
  },
  (app) => {
    // Reversão: devolve o nome de exibição anterior ("Dec Eldorado") apenas no
    // registro já existente que esta migração renomeou. Não remove registros.
    try {
      var recs = app.findRecordsByFilter(
        'empresas',
        'code = "DEC-ELDORADO" || cnpj = "45143101000150"',
        '',
        1,
        0,
      )
      for (var i = 0; i < recs.length; i++) {
        if (recs[i].getString('marca_nome_exibicao') === 'ELDORADO MATRIZ') {
          recs[i].set('marca_nome_exibicao', 'Dec Eldorado')
          app.save(recs[i])
        }
      }
    } catch (eDown) {
      console.log('0333 down: ', eDown)
    }
  },
)
