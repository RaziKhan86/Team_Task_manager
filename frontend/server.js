import { createReadStream, existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createServer } from "node:http";

const port = process.env.PORT || 5173;
const host = "0.0.0.0";
const distDir = resolve("dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = join(distDir, requestedPath);
  const safePath = filePath.startsWith(distDir) && existsSync(filePath)
    ? filePath
    : join(distDir, "index.html");

  res.setHeader("Content-Type", contentTypes[extname(safePath)] || "text/plain");
  createReadStream(safePath).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Frontend running on http://${host}:${port}`);
});
