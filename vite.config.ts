import rsc from "@vitejs/plugin-rsc/plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import { cloudflare } from "@cloudflare/vite-plugin";
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({ 
  clearScreen: false,
  build: {
    minify: false,
  },
  plugins: [
    {
      name: "patch-resolved-urls",
      configureServer(server) {
        server.resolvedUrls = {
          local: [
            ...server.resolvedUrls?.local || [],
            'http://localhost:' + server.config.server.port + '/'
          ],
          network: server.resolvedUrls?.network ?? []
        }
      },
      configResolved(config) {
        // console.dir(config.environments, { depth: null })
      },
    },
    inspect(),
    tsconfigPaths(),
    devtoolsJson(),
    tailwindcss(),
    rsc({
      entries: {
        client: "src/entry.browser.tsx",
        ssr: "src/entry.ssr.tsx",
      },
      serverHandler: false,
      loadModuleDevProxy: true
    }),
    cloudflare({
      configPath: './wrangler.jsonc',
      viteEnvironment: {
        name: 'rsc',
      },
    }),
    react(),
  ],
  environments: {
    client: {
      optimizeDeps: {
        include: ['react-router', 'react-router/internal/react-server-client'],
      },
    },
    rsc: {
      build: {
        rollupOptions: {
          // ensure `default` export only in cloudflare entry output
          preserveEntrySignatures: 'exports-only',
        },
      },
      optimizeDeps: {
        exclude: ['react-router'],
      },
    },
    ssr: {
      keepProcessEnv: false,
      build: {
        // build `ssr` inside `rsc` directory so that
        // wrangler can deploy self-contained `dist/rsc`
        outDir: './dist/rsc/ssr',
      },
      resolve: {
        noExternal: true,
      },
      optimizeDeps: {
        exclude: ['react-router'],
      },
    },
  },
});
