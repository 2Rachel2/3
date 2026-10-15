var CACHE = "hn-quest-v4";
var SHELL = ["./", "./index.html"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var same = new URL(r.url).origin === self.location.origin;
  var put = function (res) {
    if (res && (res.ok || res.type === "opaque")) { var c = res.clone(); caches.open(CACHE).then(function (ch) { ch.put(r, c); }); }
    return res;
  };
  if (same) {
    // 우리 파일은 항상 최신본을 먼저 가져오고, 오프라인일 때만 저장본을 씁니다.
    e.respondWith(fetch(r, { cache: "no-cache" }).then(put).catch(function () {
      return caches.match(r).then(function (m) { return m || (r.mode === "navigate" ? caches.match("./index.html") : undefined); });
    }));
  } else {
    // 글꼴 같은 외부 파일은 저장본이 있으면 그대로 씁니다.
    e.respondWith(caches.match(r).then(function (m) { return m || fetch(r).then(put); }));
  }
});
