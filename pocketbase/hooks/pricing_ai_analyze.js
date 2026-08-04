routerAdd(
  'POST',
  '/backend/v1/pricing/ai-analyze',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    try {
      var configs = $app.findRecordsByFilter('pricing_config', '', '-updated', 50, 0)
      var issues = []

      for (var i = 0; i < configs.length; i++) {
        var c = configs[i]
        var suggestedPrice =
          parseFloat(String(c.getString('suggested_price')).replace(',', '.')) || 0
        var totalCost = parseFloat(String(c.getString('total_cost')).replace(',', '.')) || 0
        var profitPercent = parseFloat(String(c.getString('profit_percent')).replace(',', '.')) || 0
        var minimumPrice = parseFloat(String(c.getString('minimum_price')).replace(',', '.')) || 0

        if (profitPercent < 0) {
          issues.push({
            product: c.getString('product_name'),
            code: c.getString('product_code'),
            issue: 'negative_margin',
            current_price: suggestedPrice,
            cost: totalCost,
            margin: profitPercent,
          })
        }
        if (suggestedPrice > 0 && suggestedPrice < minimumPrice) {
          issues.push({
            product: c.getString('product_name'),
            code: c.getString('product_code'),
            issue: 'below_minimum',
            current_price: suggestedPrice,
            minimum: minimumPrice,
          })
        }
        if (suggestedPrice === 0) {
          issues.push({
            product: c.getString('product_name'),
            code: c.getString('product_code'),
            issue: 'no_price',
            cost: totalCost,
          })
        }
      }

      if (issues.length === 0) {
        return e.json(200, {
          suggestions: [],
          total_analyzed: configs.length,
          message: 'Nenhum produto com problemas encontrado.',
        })
      }

      var prompt =
        'Analise os seguintes produtos com problemas de precificacao e sugira ajustes. Para cada produto sugira: novo_preco, nova_margem, markup_ideal, melhor_tabela e motivo. Responda APENAS com JSON array.\n\nProdutos:\n' +
        JSON.stringify(issues.slice(0, 20))

      var reply = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Voce e um especialista em precificacao. Analise produtos e sugira ajustes de preco. Responda APENAS com JSON valido array de objetos com campos: product, code, issue, suggested_price, suggested_margin, suggested_markup, recommended_table, reason.',
          },
          { role: 'user', content: prompt },
        ],
      })

      var content = reply.choices[0].message.content
      var suggestions = []
      try {
        var jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0])
        }
      } catch (_) {}

      return e.json(200, { suggestions: suggestions, total_analyzed: configs.length })
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporariamente indisponivel' })
      if (err instanceof SkipAiError)
        return e.json(502, { error: 'AI temporariamente indisponivel' })
      $app.logger().error('pricing ai analyze failed', 'error', String(err))
      return e.json(500, { error: 'Erro interno' })
    }
  },
  $apis.requireAuth(),
)
