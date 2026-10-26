import {defineConfig} from 'vite';
export default defineConfig({
  resolve: {
    alias: process.env.HUB_REGISTRY_SNAPSHOT ? [
      {find: '../data/registry.json', replacement: process.env.HUB_REGISTRY_SNAPSHOT},
    ] : [],
  },
  define: {__RUNTIME__: process.env.HUB_RUNTIME || 'null'},
  build: {outDir: process.env.HUB_OUT_DIR || '../dist/hub', emptyOutDir: false},
});
