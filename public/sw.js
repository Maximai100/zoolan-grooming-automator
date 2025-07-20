const CACHE_NAME = 'zooplan-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/src/index.css',
  '/src/main.tsx',
  '/favicon.ico'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/rest\/v1\/clients/,
  /\/rest\/v1\/appointments/,
  /\/rest\/v1\/services/,
  /\/rest\/v1\/pets/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first with fallback to cache
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle API requests
  const isApiRequest = API_CACHE_PATTERNS.some(pattern => 
    pattern.test(event.request.url)
  );

  if (isApiRequest) {
    event.respondWith(
      networkFirstStrategy(event.request)
    );
    return;
  }

  // Handle static resources
  event.respondWith(
    cacheFirstStrategy(event.request)
  );
});

// Network first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return cached version if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for GET requests
    if (request.method === 'GET') {
      return caches.match(OFFLINE_URL);
    }
    
    throw error;
  }
}

// Cache first strategy for static resources
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // For failed requests, try to return offline page
    return caches.match(OFFLINE_URL);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-appointments') {
    event.waitUntil(syncPendingAppointments());
  }
  
  if (event.tag === 'background-sync-clients') {
    event.waitUntil(syncPendingClients());
  }
});

// Sync pending appointments when back online
async function syncPendingAppointments() {
  // This would sync any pending appointment changes stored in IndexedDB
  console.log('Syncing pending appointments...');
}

// Sync pending client data when back online
async function syncPendingClients() {
  // This would sync any pending client changes stored in IndexedDB
  console.log('Syncing pending client data...');
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.url,
    actions: [
      {
        action: 'view',
        title: 'Открыть',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Закрыть'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' && event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});