var CACHE = "hn-quest-v1";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var put = function (res) {
    if (res && (res.ok || res.type === "opaque")) { var c = res.clone(); caches.open(CACHE).then(function (ch) { ch.put(r, c); }); }
    return res;
  };
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(put).catch(function () { return caches.match(r).then(function (m) { return m || caches.match("./index.html"); }); }));
  } else {
    e.respondWith(caches.match(r).then(function (m) { return m || fetch(r).then(put); }));
  }
});
