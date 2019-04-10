importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute([
  {
    "url": "claim-history/index.html",
    "revision": "f29c02619cc956c8bbff5909f53babfd"
  },
  {
    "url": "index.html",
    "revision": "6262ef2a2f9aa92fbba67918899efd7b"
  },
  {
    "url": "manifest.json",
    "revision": "a4e6989f1461b8f604cfccbe60ae69f4"
  },
  {
    "url": "src/css/app.css",
    "revision": "63e44c932707ba752c764d15e9468375"
  },
  {
    "url": "src/css/claim.css",
    "revision": "938a3c2a2c94e15ff7524b54f89b9f5c"
  },
  {
    "url": "src/js/app.js",
    "revision": "d02ccc1846db6ef2922041225fd1253b"
  },
  {
    "url": "src/js/claim.js",
    "revision": "c220de938b7a2e8b9657d6cd38c5c79e"
  },
  {
    "url": "src/js/material.js",
    "revision": "60f3ee61721d5bbac709fad9c239f2ac"
  },
  {
    "url": "sw-base.js",
    "revision": "eafa8c06de3e7a3c274564ee846477a8"
  },
  {
    "url": "sw.js",
    "revision": "d97468e4e199d1d3c6bdb395cefbd228"
  },
  {
    "url": "src/images/students.jpg",
    "revision": "81bf9519d8b1bce22026e347c10531d2"
  }
]);

workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, 
	workbox.strategies.staleWhileRevalidate({
    	cacheName: 'google-fonts'
}));

workbox.routing.registerRoute('https://code.getmdl.io/1.3.0/material.teal-red.min.css', 
	workbox.strategies.staleWhileRevalidate({
    	cacheName: 'material-css'
}));

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, 
	workbox.strategies.staleWhileRevalidate({
    	cacheName: 'claim-images'
}));

