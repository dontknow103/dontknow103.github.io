import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    [
      vue(),
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
            dest: "/",
          },
          {
            src: "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs",
            dest: "/",
          },
        ],
      }),
    ],
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: process.env.NODE_ENV === "production" ? "/" : "/",
});
