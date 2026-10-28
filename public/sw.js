// Service Worker para HURAM Coletor PWA
// Cache estático do app shell e suporte a offline para telas do coletor

const CACHE_NAME = 'huram-collector-v1'
const SHELL_URLS = [
  '/',
  '/admin/coletor',
  '/admin/coletor/turno',
  '/admin/coletor/recebimento',
  '/admin/coletor/enderecamento',
  '/admin/coletor/separacao',
  '/admin/coletor/conferencia',
  '/admin/coletor/inventario',
  '/admin/coletor/transferencia',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS).catch(() => {
        // Ignora recursos que possam falhar em pré-cache
      })
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        }),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Ignora chamadas de API do PocketBase para que os dados sejam sempre consultados frescos
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/backend')) {
    return
  }

  // Network-first com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return networkResponse
      })
      .catch(() => caches.match(event.request)),
  )
})
