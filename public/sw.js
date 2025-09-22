const CACHE_NAME = 'study-buddy-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/upload', 
  '/library',
  '/profile',
  '/offline.html',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/',
  'https://xcmolehaquqldfxqtqst.supabase.co/rest/v1/'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            )
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Static files - Cache First strategy
  if (STATIC_FILES.some(path => url.pathname === path || url.pathname.startsWith(path))) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              return caches.open(STATIC_CACHE)
                .then(cache => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        })
    );
    return;
  }

  // API requests - Network First with cache fallback
  if (API_ENDPOINTS.some(endpoint => url.href.includes(endpoint))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a custom offline response for API calls
              return new Response(JSON.stringify({
                error: 'Offline',
                message: 'This content is not available offline'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Images and assets - Cache First strategy
  if (request.destination === 'image' || url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
            .then(fetchResponse => {
              return caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            })
            .catch(() => {
              // Return placeholder for failed image loads
              if (request.destination === 'image') {
                return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text></svg>', {
                  headers: { 'Content-Type': 'image/svg+xml' }
                });
              }
            });
        })
    );
    return;
  }

  // Default - Network First
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request)
          .then(cachedResponse => {
            return cachedResponse || caches.match('/offline.html');
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'upload-question') {
    event.waitUntil(syncUploadedQuestions());
  }
  
  if (event.tag === 'quiz-attempt') {
    event.waitUntil(syncQuizAttempts());
  }
});

// Sync functions
async function syncUploadedQuestions() {
  try {
    const db = await openIndexedDB();
    const questions = await getOfflineQuestions(db);
    
    for (const question of questions) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(question)
        });
        
        if (response.ok) {
          await removeOfflineQuestion(db, question.id);
          console.log('Question synced:', question.id);
        }
      } catch (error) {
        console.error('Failed to sync question:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncQuizAttempts() {
  try {
    const db = await openIndexedDB();
    const attempts = await getOfflineQuizAttempts(db);
    
    for (const attempt of attempts) {
      try {
        const response = await fetch('/api/quiz-attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt)
        });
        
        if (response.ok) {
          await removeOfflineQuizAttempt(db, attempt.id);
          console.log('Quiz attempt synced:', attempt.id);
        }
      } catch (error) {
        console.error('Failed to sync quiz attempt:', error);
      }
    }
  } catch (error) {
    console.error('Quiz sync failed:', error);
  }
}

// IndexedDB helper functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudyBuddyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('quizAttempts')) {
        db.createObjectStore('quizAttempts', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('content')) {
        db.createObjectStore('content', { keyPath: 'id' });
      }
    };
  });
}

function getOfflineQuestions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['questions'], 'readonly');
    const store = transaction.objectStore('questions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineQuestion(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['questions'], 'readwrite');
    const store = transaction.objectStore('questions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function getOfflineQuizAttempts(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['quizAttempts'], 'readonly');
    const store = transaction.objectStore('quizAttempts');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineQuizAttempt(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['quizAttempts'], 'readwrite');
    const store = transaction.objectStore('quizAttempts');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.url ? { url: data.url } : undefined,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});