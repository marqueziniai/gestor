/* Service worker do Gestor: guarda o app para abrir sem internet.
   Os dados continuam no localStorage do navegador; aqui só ficam os arquivos do app. */
const CACHE = 'gestor-v4.2';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png',
  './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// rede primeiro, sempre revalidando (sem cópia velha do cache HTTP); sem rede, usa a cópia guardada
self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(new Request(req.url, {cache:'no-cache', credentials:'same-origin'})).then(function(res){
      if(res.ok){ const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
