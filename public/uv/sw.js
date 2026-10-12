/* Ultraviolet */
try {
  importScripts("/uv/uv.bundle.js");
  importScripts("/uv/uv.config.js");
  importScripts("/uv/uv.sw.js");
} catch (e) {
  console.warn("UV load failed", e);
}

let uv = null;
try {
  if (typeof UVServiceWorker === "function") uv = new UVServiceWorker();
} catch (e) {}

/* Scramjet */
try {
  importScripts("/scramjet/scramjet.all.js");
} catch (e) {
  console.warn("Scramjet load failed", e);
}

let scramjet = null;
try {
  if (typeof $scramjetLoadWorker === "function") {
    const { ScramjetServiceWorker } = $scramjetLoadWorker();
    scramjet = new ScramjetServiceWorker();
  }
} catch (e) {}

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        if (scramjet) {
          await scramjet.loadConfig();
          if (scramjet.route(event)) return await scramjet.fetch(event);
        }
      } catch (e) {}

      try {
        if (uv) {
          if (typeof uv.route === "function") {
            if (uv.route(event)) return await uv.fetch(event);
          } else {
            return await uv.fetch(event);
          }
        }
      } catch (e) {}

      return fetch(event.request);
    })()
  );
});
