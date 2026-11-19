// Révisions CDB – garde le chargeur sur l'appareil pour qu'il s'ouvre sans réseau.
// L'application elle-même et les fiches sont gardées par la page (IndexedDB), pas ici.
const CACHE = "cdb-shell-v2";   // v2 : polices B612 (thème cockpit, application 4.11)
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png",
  "fonts/B612-Regular.woff2", "fonts/B612-Bold.woff2", "fonts/B612Mono-Regular.woff2", "fonts/B612Mono-Bold.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// réseau d'abord (mises à jour du chargeur), copie locale sans réseau ; les appels au script Google ne passent pas ici
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(u.pathname.endsWith("/") ? "./" : e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./")))
  );
});
