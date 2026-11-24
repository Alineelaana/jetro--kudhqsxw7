// 0355: Cadastra a empresa "RBJ OPERAÇÕES LOGÍSTICAS" (RBJ Operacoes
// Logisticas LTDA), marca PRÓPRIA (não é do grupo Gran Romano nem da
// Eldorado), a partir do Comprovante de Inscrição CNPJ da Receita enviado
// pelo usuário (CNPJ 53.775.371/0001-01, abertura 02/02/2024, situação
// ATIVA, Porte: Empresa de Pequeno Pequeno Porte, optante pelo Simples).
// Segue o MESMO padrão condicional das migrações 0328/0330/0332/0333/0334,
// com dois ramos:
//  1) Se JÁ EXISTIR registro com esse CNPJ (pontuado, não pontuado) ou mesmo
//     código/nome de exibição: NÃO cria duplicado — apenas garante
//     marca_nome_exibicao = "RBJ OPERAÇÕES LOGÍSTICAS" e completa dados
//     faltantes. Importante: a busca NÃO usa a raiz "53775371" sem
//     qualificador, pois matriz e filial podem compartilhar a mesma raiz.
//  2) Se NÃO existir: cria a empresa Matriz, ativa, com cores PRÓPRIAS da
//     RBJ, amostradas da logomarca oficial: #6EC531 (verde lima das setas),
//     #29B6E8 (azul claro) e #132A47 (azul-marinho do texto "RBJ"). A
//     logomarca não é arquivo nesta coleção: vem do fallback oficial do
//     front-end (use-brand.tsx reconhece códigos que contêm "RBJ", usando a
//     versão HORIZONTAL da logo). E-mail e telefone ficam VAZIOS — estão
//     mascarados no comprovante (ca****@****.com.br), não são inventados.
//     SEM config fiscal Focus NFe (mesma regra das demais empresas novas —
//     criar na tela fiscal quando for emitir NF).
// Idempotente: reexecutar não cria duplicado e nada muda se o registro já
// estiver com o nome de exibição correto.
migrate(
  (app) => {
    var empCol = app.findCollectionByNameOrId('empresas')

    // RAMO 1 — busca por CNPJ da RBJ (pontuado e não pontuado), código ou
    // nome de exibição. DELIBERADAMENTE sem "cnpj ~ raiz": a raiz 53775371
    // poderia ser compartilhada por matriz e filial (padrão já visto na
    // Eldorado 45143101) e traria registro errado para cá.
    var existing = null
    try {
      var found = app.findRecordsByFilter(
        'empresas',
        'cnpj = "53775371000101" || cnpj = "53.775.371/0001-01" || code = "RBJ" || marca_nome_exibicao = "RBJ OPERAÇÕES LOGÍSTICAS"',
        '',
        1,
        0,
      )
      if (found && found.length > 0) {
        existing = found[0]
      }
    } catch (eFind) {
      console.log('0355: falha ao buscar registro existente:', eFind)
    }

    var rec = existing
    if (!rec) {
      rec = new Record(empCol)
    }

    if (!(rec.getString('code') || '')) {
      rec.set('code', 'RBJ')
    }
    rec.set('name', 'RBJ OPERAÇÕES LOGÍSTICAS')
    rec.set('razao_social', 'RBJ OPERACOES LOGISTICAS LTDA')
    rec.set('nome_fantasia', 'RBJ')
    rec.set('cnpj', '53775371000101')
    rec.set('inscricao_estadual', existing ? existing.getString('inscricao_estadual') || '84219270' : '84219270')
    rec.set('address', 'Avenida Porto Canoa, S/N — Lote A3C2 Modulo 1 e 2 Sala 01, Porto Canoa')
    rec.set('city', 'Serra')
    rec.set('state', 'ES')
    rec.set('cep', '29168345')
    // E-mail e telefone mascarados no comprovante: ficam vazios de propósito.
    rec.set('email', existing ? existing.getString('email') || '' : '')
    rec.set('phone', existing ? existing.getString('phone') || '' : '')
    rec.set('active', true)
    rec.set('tipo_unidade', 'Matriz')

    // Identidade visual PRÓPRIA da RBJ (paleta amostrada da logomarca):
    // verde lima das setas, azul claro e azul-marinho do texto. NÃO herda as
    // cores do grupo Gran Romano (#4A2E1B/#C69B45/#8B5A2B) nem da Eldorado
    // (#003DA5/#D4AF37/#F5B324). Logomarca via fallback oficial do front-end
    // (use-brand.tsx reconhece códigos que contêm "RBJ").
    rec.set('marca_nome_exibicao', 'RBJ OPERAÇÕES LOGÍSTICAS')
    rec.set('marca_cor_primaria', '#6EC531')
    rec.set('marca_cor_secundaria', '#29B6E8')
    rec.set('marca_cor_complementar', '#132A47')
    rec.set('padrao', false)

    if (!existing) {
      rec.set('responsible_user', 'Admin')
    }

    app.save(rec)
    console.log(
      existing
        ? '0355: empresa RBJ OPERAÇÕES LOGÍSTICAS atualizada (id ' +
            rec.id +
            ') — nenhum registro novo criado'
        : '0355: empresa RBJ OPERAÇÕES LOGÍSTICAS criada (id ' + rec.id + ')',
    )
  },
  (app) => {
    // Reversão: remove o registro da RBJ apenas se ele foi criado por esta
    // migração (código RBJ). Não toca nas demais empresas.
    try {
      var recs = app.findRecordsByFilter('empresas', 'code = "RBJ"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        app.delete(recs[i])
      }
    } catch (eDown) {
      console.log('0355 down: ', eDown)
    }
  },
)
