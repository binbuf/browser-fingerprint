import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  base: "/browser-fingerprint/",
  build: {
    outDir: "dist",
    target: "es2022",
  },
});
