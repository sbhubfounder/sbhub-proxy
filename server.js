import express from "express";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";

import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicPath = join(__dirname, "public");
const port = Number(process.env.PORT) || 8080;

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// Your SB HUB page + sw.js
app.use(express.static(publicPath));

// Ultraviolet
app.use("/uv/", express.static(uvPath));

// Transports
app.use("/epoxy/", express.static(epoxyPath));
app.use("/libcurl/", express.static(libcurlPath));
app.use("/baremux/", express.static(baremuxPath));

// Scramjet (for mirror domains)
try {
  const sjRoot = dirname(require.resolve("@mercuryworkshop/scramjet/package.json"));
  app.use("/scramjet/", express.static(join(sjRoot, "dist")));
} catch (e) {
  console.warn("Scramjet dist not found:", e.message);
}

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(join(publicPath, "index.html"));
});

server.on("upgrade", (req, socket, head) => {
  if (req.url && req.url.includes("/wisp")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log("SB HUB proxy on port", port);
});
