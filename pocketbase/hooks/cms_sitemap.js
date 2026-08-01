routerAdd('GET', '/backend/v1/cms/sitemap', (e) => {
  var baseUrl = $secrets.get('SITE_URL') || 'https://logistica-premium-es-2cc14.goskip.app'
  var pages = [
    '/',
    '/cliente/login',
    '/politica-de-privacidade',
    '/termos-de-uso',
    '/politica-comercial',
    '/politica-de-cookies',
  ]

  var xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for (var i = 0; i < pages.length; i++) {
    xml +=
      '  <url>\n    <loc>' +
      baseUrl +
      pages[i] +
      '</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
  }
  xml += '</urlset>'

  e.response.header().set('Content-Type', 'application/xml')
  return e.string(200, xml)
})
