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

// ========================================
// BACKGROUND SYNC
// ========================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-surveys') {
    console.log('Background Sync triggered')

    event.waitUntil(
      syncPendingSurveys()
    )
  }
})

async function syncPendingSurveys() {
  console.log('Syncing pending surveys...')

  const API_URL =
    'https://script.google.com/macros/s/AKfycbxdRnwb7l4ikNhcH7oB1Z4bgeo4m6i2iyEQz8lOpV5xk1xGEI5-6nQInzmgqPLBCkVI/exec'

  // Open IndexedDB
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('VKUFieldSurveyDB')

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  // Get all surveys
  const surveys = await new Promise((resolve, reject) => {
    const transaction = db.transaction(
      'surveys',
      'readonly'
    )

    const store =
      transaction.objectStore('surveys')

    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  // Only Pending surveys
  const pendingSurveys = surveys.filter(
    survey => survey.status === 'Pending'
  )

  console.log(
    'Pending surveys found:',
    pendingSurveys.length
  )

  for (const survey of pendingSurveys) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          ...survey,
          photo: survey.photo
            ? survey.photo.name
            : ''
        })
      })

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(
          result.error || 'Google Sheets sync failed'
        )
      }

      // Update status to Synced
      const transaction = db.transaction(
        'surveys',
        'readwrite'
      )

      const store =
        transaction.objectStore('surveys')

      survey.status = 'Synced'

      store.put(survey)

      console.log(
        'Survey synced successfully:',
        survey.id
      )

    } catch (error) {
      console.error(
        'Failed to sync survey:',
        survey.id,
        error
      )
    }
  }

  db.close()
}