// Nome do cache (altere CACHE_VERSION a cada deploy para forçar atualização)
const CACHE_VERSION = 'v7'
const CACHE_NAME = `orcamento-facil-xp-${CACHE_VERSION}`

// Arquivos para cache inicial
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico',
]

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache aberto:', CACHE_NAME)
      // Tenta adicionar cada arquivo individualmente para evitar falha total
      return Promise.all(
        urlsToCache.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[SW] Falha ao cachear:', url, err)
            // Não falha todo o processo se um arquivo não existir
          })
        })
      )
    })
  )
  // NÃO chama skipWaiting aqui - aguarda comando do usuário via mensagem
  console.log('[SW] Nova versão instalada, aguardando ativação...')
})

// Estratégia de cache:
// - Network First para páginas (HTML/navegação) para sempre buscar a última versão
// - Cache First para outros assets (imagens, CSS, JS)
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Páginas de navegação (equivalente a documentos HTML)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Demais assets: cache first
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) return response

      const fetchRequest = request.clone()
      return fetch(fetchRequest).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse
        }

        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return networkResponse
      })
    })
  )
})

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando nova versão...')
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log('[SW] Caches encontrados:', cacheNames)
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deletando cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Nova versão ativada, assumindo controle...')
        return self.clients.claim()
      })
  )
})

// Permite que o cliente force a ativação imediata da nova versão
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Comando SKIP_WAITING recebido, ativando nova versão...')
    self.skipWaiting()
  }
})
