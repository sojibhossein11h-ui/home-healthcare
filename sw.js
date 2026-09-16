const CACHE_NAME = 'home-healthcare-v3';
const ASSETS = ['./', './manifest.json', './icon.svg'];
const PATIENT_FIELD_FIX = `<script>
(function(){
  function fixPatientName(){
    const field=document.getElementById('patientName');
    if(!field) return;
    field.type='text';
    field.name='patientName';
    field.setAttribute('autocomplete','off');
    field.setAttribute('autocorrect','off');
    field.setAttribute('autocapitalize','words');
    field.setAttribute('spellcheck','false');
    field.setAttribute('inputmode','text');
    field.removeAttribute('list');
    field.removeAttribute('pattern');
    field.removeAttribute('form');
  }
  document.addEventListener('DOMContentLoaded',fixPatientName);
  new MutationObserver(fixPatientName).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      const type = response.headers.get('content-type') || '';
      if (type.includes('text/html')) {
        const html = await response.text();
        const fixed = html.replace('</body>', PATIENT_FIELD_FIX + '</body>');
        const result = new Response(fixed, {status: response.status, statusText: response.statusText, headers: response.headers});
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, result.clone());
        return result;
      }
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
      return response;
    } catch (_) {
      return caches.match('./index.html');
    }
  })());
});
