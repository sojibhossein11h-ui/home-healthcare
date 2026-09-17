const CACHE_NAME = 'home-healthcare-v4';
const CORE = ['./', './index.html', './manifest.json', './icon.svg', './patient-auth.html', './supabase-client.js'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith((async()=>{
    try { const r = await fetch(event.request); const c = await caches.open(CACHE_NAME); c.put(event.request, r.clone()); return r; }
    catch (_) { return (await caches.match(event.request)) || (await caches.match('./index.html')); }
  })());
});
