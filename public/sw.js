const CACHE_NAME = 'vku-field-survey-v2'

console.log('Service Worker file is running')


// ========================================
// INSTALL
// ========================================

self.addEventListener('install', (event) => {
  console.log('Service Worker installed')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add('/')
    })
  )

  self.skipWaiting()
})


// ========================================
// ACTIVATE
// ========================================

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  self.clients.claim()
})


// ========================================
// FETCH
// ========================================

self.addEventListener('fetch', (event) => {

  const request = event.request
  const url = new URL(request.url)


  // ----------------------------------------
  // Only handle HTTP/HTTPS requests
  // ----------------------------------------

  if (
    request.method !== 'GET' ||
    (url.protocol !== 'http:' && url.protocol !== 'https:')
  ) {
    return
  }


  // ----------------------------------------
  // Only cache requests from this app
  // ----------------------------------------

  if (url.origin !== self.location.origin) {
    return
  }


  event.respondWith(

    // --------------------------------------
    // Try network first
    // --------------------------------------

    fetch(request)
      .then((networkResponse) => {

        // Only cache successful responses
        if (networkResponse && networkResponse.ok) {

          const responseToCache =
            networkResponse.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
        }

        return networkResponse
      })

      // ------------------------------------
      // Network failed → use cache
      // ------------------------------------

      .catch(() => {

        return caches.match(request).then((cachedResponse) => {

          if (cachedResponse) {
            return cachedResponse
          }

          // No network and no cache
          return new Response(
            'Offline - resource not available in cache.',
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: {
                'Content-Type': 'text/plain'
              }
            }
          )
        })
      })
  )
})