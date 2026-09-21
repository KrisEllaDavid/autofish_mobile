import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import type { IncomingMessage } from "http";

const API_TARGET = "https://api.autofish.online";
// The image server is plain HTTP with no certificate, so `secure` is off
// for its proxies only. Images are *served* through the API proxy instead.
const IMAGE_TARGET = "http://169.58.128.180:3001";

/** Shared logging so a failing proxy says which one failed. */
const trace =
  (label: string) =>
  (proxy: {
    on(
      event: "error",
      cb: (err: Error, req: IncomingMessage) => void
    ): void;
    on(
      event: "proxyRes",
      cb: (res: IncomingMessage, req: IncomingMessage) => void
    ): void;
  }) => {
    proxy.on("error", (err) => {
      console.error(`[vite-proxy:${label}] error:`, err.message);
    });
    proxy.on("proxyRes", (res, req) => {
      console.log(`[vite-proxy:${label}] <-`, res.statusCode, req.url);
    });
  };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // HTTPS locally because getUserMedia (the ID-capture camera) refuses to
    // run on an insecure origin that is not localhost.
    https: {
      key: fs.readFileSync("./certs/local-key.pem"),
      cert: fs.readFileSync("./certs/local-cert.pem"),
    },
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    // Web development only. The mobile build talks to the API through
    // CapacitorHttp, which is not subject to CORS.
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        proxyTimeout: 30000,
        timeout: 30000,
        ws: false,
        configure: trace("/api"),
      },

      // The image service uses this prefix as its dev base URL. The prefix
      // is stripped on the way out so the forwarded path matches what the
      // production base URL produces.
      "/image-server": {
        target: IMAGE_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/image-server/, ""),
        configure: trace("/image-server"),
      },

      // Deliberately no bare "/images" proxy: it used to shadow the local
      // public/images/ folder (a request for /images/splash_image.svg was
      // forwarded to the remote image server and 404'd instead of being
      // served from disk). No code path actually needs it — imageService
      // always calls through "/image-server" in dev.
    },
  },
});
