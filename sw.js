/* Service worker: light offline cache. Regenerate PRECACHE when files in img/ photo/ icons/ change, and bump VERSION. */
var VERSION='v1';
var CACHE='woxa-outing-'+VERSION;
var PRECACHE=["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "img/00b-chinese-lanterns.svg", "img/07-25-airport-look.svg", "img/07-26-smart-casual.svg", "img/07-27-day-woxa-polo.svg", "img/07-27-night-chinese-party.svg", "img/07-29-smart-casual.svg", "img/07-30-airport-look.svg", "img/08-baggage.svg", "img/08-bus.svg", "img/08-flight.svg", "img/08-hotel.svg", "img/09-bus-front.svg", "img/09-calendar.svg", "img/09-camera.svg", "img/09-cutlery.svg", "img/09-flight-silhouette.svg", "img/09-group.svg", "img/09-hotel-tower.svg", "img/09-meeting-pin.svg", "img/09-pagoda.svg", "img/09-shopping-bag.svg", "img/09-suitcase-silhouette.svg", "img/09-sun.svg", "photo/00-shanghai-hero.jpg", "photo/01-khon-kaen-airport.jpg", "photo/01b-suvarnabhumi.jpg", "photo/02a-longhua-temple.jpg", "photo/02b-the-bund.jpg", "photo/03a-zhujiajiao.jpg", "photo/03b-chinese-banquet.jpg", "photo/04-free-day.jpg", "photo/05a-chenghuangmiao.jpg", "photo/05b-florentia-village.jpg", "photo/06-flight-home.jpg", "photo/07-hotel-twin-room.jpg"];
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){
  return Promise.all(PRECACHE.map(function(u){return c.add(u).catch(function(){})}));
 }).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){
  return Promise.all(ks.filter(function(k){return k.indexOf('woxa-outing-')===0&&k!==CACHE}).map(function(k){return caches.delete(k)}));
 }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var req=e.request;
 if(req.method!=='GET')return;
 var url=new URL(req.url);
 var isFont=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
 if(url.origin!==location.origin&&!isFont)return;
 /* page: network first (updates arrive), cache fallback offline */
 if(req.mode==='navigate'||url.pathname.slice(-1)==='/'||/index\.html$/.test(url.pathname)){
  e.respondWith(fetch(req).then(function(r){
   var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp)});return r;
  }).catch(function(){return caches.match(req).then(function(m){return m||caches.match('index.html')||caches.match('./')})}));
  return;
 }
 /* assets and fonts: cache first, refresh in background */
 e.respondWith(caches.match(req).then(function(m){
  var net=fetch(req).then(function(r){
   if(r&&(r.ok||r.type==='opaque')){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp)})}
   return r;
  }).catch(function(){return m});
  return m||net;
 }));
});
