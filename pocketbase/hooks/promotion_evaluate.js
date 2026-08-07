routerAdd(
  'POST',
  '/backend/v1/promotions/simulate',
  (e) => {
    const body = e.requestInfo().body || {}
    const cart = body.cart || []

    var promos = []
    try {
      promos = $app.findRecordsByFilter('promotion_rules', "status = 'ativo'", '-priority', 0, 0)
    } catch (err) {
      return e.json(200, {
        activatedRules: [],
        totalDiscount: 0,
        totalBonification: 0,
        marginBefore: 0,
        marginAfter: 0,
        suggestions: [],
      })
    }

    var cartTotal = 0
    for (var i = 0; i < cart.length; i++) {
      cartTotal += (cart[i].quantity || 0) * (cart[i].unit_price || 0)
    }

    var activatedRules = []
    var suggestions = []

    for (var j = 0; j < promos.length; j++) {
      var promo = promos[j]
      var conditions = promo.get('conditions')
      if (typeof conditions === 'string') {
        try {
          conditions = JSON.parse(conditions)
        } catch (e2) {
          conditions = []
        }
      }
      if (!Array.isArray(conditions)) conditions = []
      var benefits = promo.get('benefits')
      if (typeof benefits === 'string') {
        try {
          benefits = JSON.parse(benefits)
        } catch (e3) {
          benefits = []
        }
      }
      if (!Array.isArray(benefits)) benefits = []

      var activated = false
      for (var k = 0; k < conditions.length; k++) {
        var cond = conditions[k]
        if (cond.field === 'min_value') {
          if (cartTotal >= parseFloat(cond.value || '0')) {
            activated = true
          } else {
            suggestions.push(
              'Faltam R$ ' +
                (parseFloat(cond.value || '0') - cartTotal).toFixed(2) +
                ' para atingir: ' +
                promo.getString('name'),
            )
          }
        } else if (cond.field === 'product_id') {
          var found = false
          for (var ci = 0; ci < cart.length; ci++) {
            if (cart[ci].product_id === cond.value) {
              found = true
              break
            }
          }
          if (found) activated = true
        } else if (cond.field === 'brand') {
          var brandFound = false
          for (var bi = 0; bi < cart.length; bi++) {
            if (cart[bi].brand === cond.value) {
              brandFound = true
              break
            }
          }
          if (brandFound) activated = true
        } else if (cond.field === 'category') {
          var catFound = false
          for (var cti = 0; cti < cart.length; cti++) {
            if (cart[cti].category === cond.value) {
              catFound = true
              break
            }
          }
          if (catFound) activated = true
        }
      }
      if (conditions.length === 0) activated = true

      if (activated) {
        var ruleDiscount = 0
        var ruleBonification = 0
        for (var b = 0; b < benefits.length; b++) {
          var benefit = benefits[b]
          if (benefit.type === 'percentage') {
            ruleDiscount += cartTotal * (parseFloat(benefit.value || '0') / 100)
          } else if (benefit.type === 'discount') {
            ruleDiscount += parseFloat(benefit.value || '0')
          } else if (benefit.type === 'bonified_product' || benefit.type === 'bonified_quantity') {
            ruleBonification += parseFloat(benefit.value || '0')
          }
        }
        activatedRules.push({
          promotion_id: promo.id,
          promotion_name: promo.getString('name'),
          benefits: benefits,
          discount_value: ruleDiscount,
          bonification_value: ruleBonification,
          priority: promo.get('priority') || 0,
          cumulativity: promo.getString('cumulativity') || 'cumulative',
        })
      }
    }

    var cumul = activatedRules.filter(function (r) {
      return r.cumulativity === 'cumulative'
    })
    var nonCumul = activatedRules.filter(function (r) {
      return r.cumulativity === 'non_cumulative'
    })
    var priority = activatedRules.filter(function (r) {
      return r.cumulativity === 'priority'
    })
    var best = activatedRules.filter(function (r) {
      return r.cumulativity === 'most_advantageous'
    })
    if (nonCumul.length > 1) {
      nonCumul.sort(function (a, b) {
        return b.priority - a.priority
      })
      nonCumul = [nonCumul[0]]
    }
    if (priority.length > 1) {
      priority.sort(function (a, b) {
        return b.priority - a.priority
      })
      priority = [priority[0]]
    }
    if (best.length > 1) {
      best.sort(function (a, b) {
        return b.discount_value - a.discount_value
      })
      best = [best[0]]
    }
    var finalRules = cumul.concat(nonCumul, priority, best)
    var totalDiscount = 0
    var totalBonification = 0
    for (var fi = 0; fi < finalRules.length; fi++) {
      totalDiscount += finalRules[fi].discount_value
      totalBonification += finalRules[fi].bonification_value
    }

    return e.json(200, {
      activatedRules: finalRules,
      totalDiscount: totalDiscount,
      totalBonification: totalBonification,
      marginBefore: cartTotal,
      marginAfter: cartTotal - totalDiscount,
      suggestions: suggestions,
    })
  },
  $apis.requireAuth(),
)
