// 0356: Escurece o verde predominante da RBJ OPERAÇÕES LOGÍSTICAS a pedido do
// usuário ("o verde está fluorescente demais para um sistema"). Migrando de
// #6EC531 (verde lima muito brilhante, amostrado da logomarca) para #4C9A2A —
// um degrau mais escuro no mesmo tom de verde, mais sóbrio para interface.
// Somente a marca_cor_primaria muda: #29B6E8 (secundária) e #132A47
// (complementar) ficam intocadas, e nenhuma outra empresa é afetada.
// Idempotente: atualiza APENAS o registro da RBJ (código "RBJ" ou CNPJ
// 53775371000101, nunca pela raiz do CNPJ sozinha) e só quando a cor atual for
// ainda o verde antigo — reexecutar não muda nada. Nunca duplica.
migrate(
  (app) => {
    var found = app.findRecordsByFilter(
      'empresas',
      'code = "RBJ" || cnpj = "53775371000101" || cnpj = "53.775.371/0001-01" || marca_nome_exibicao = "RBJ OPERAÇÕES LOGÍSTICAS"',
      '',
      1,
      0,
    )
    if (!found || found.length === 0) {
      console.log('0356: nenhuma empresa RBJ encontrada — nada a fazer')
      return
    }
    var rec = found[0]
    var corAtual = rec.getString('marca_cor_primaria') || ''
    if (corAtual.trim().toUpperCase() === '#4C9A2A') {
      console.log('0356: RBJ (id ' + rec.id + ') já está com o verde #4C9A2A — nada a fazer')
      return
    }
    rec.set('marca_cor_primaria', '#4C9A2A')
    app.save(rec)
    console.log(
      '0356: cor primária da RBJ (id ' + rec.id + ') atualizada de ' + corAtual + ' para #4C9A2A',
    )
  },
  (app) => {
    // Reversão: devolve o verde original apenas no registro da RBJ.
    try {
      var recs = app.findRecordsByFilter('empresas', 'code = "RBJ"', '', 1, 0)
      for (var i = 0; i < recs.length; i++) {
        recs[i].set('marca_cor_primaria', '#6EC531')
        app.save(recs[i])
      }
    } catch (eDown) {
      console.log('0356 down: ', eDown)
    }
  },
)
