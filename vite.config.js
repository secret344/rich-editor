import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";

/**
 * Vite plugin that stubs optional LangChain provider packages.
 * These are peer deps of @my-editor/rich-text-editor; users install only the
 * ones they need. In dev/build environments where they're absent, Vite's
 * import-analysis would fail unless we provide a stub that throws at runtime.
 */
function stubOptionalLangchainProviders() {
  const optionalPkgs = [
    '@langchain/openai',
    '@langchain/anthropic',
    '@langchain/google-genai',
  ]
  return {
    name: 'stub-optional-langchain-providers',
    resolveId(id) {
      if (optionalPkgs.includes(id)) return `\0virtual:${id}`
    },
    load(id) {
      // Only handle exact virtual IDs that were registered by resolveId above.
      // The virtual prefix `\0virtual:` combined with the allowlist check in
      // resolveId ensures the pkg name cannot be user-injected.
      const prefix = '\0virtual:'
      if (!id.startsWith(prefix)) return
      const pkgName = id.slice(prefix.length)
      if (!optionalPkgs.includes(pkgName)) return
      // Return a module that throws a clear error when imported at runtime,
      // matching what the .catch() handler in AIService.ts expects.
      return `export default {}; throw new Error('[AIService] ${pkgName} is not installed. Install with: npm install ${pkgName}')`
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    stubOptionalLangchainProviders(),
    vue(),
    tailwindcss(),
    legacy({
      targets: ["defaults", "not IE 8"],
      modernPolyfills: true,
      renderLegacyChunks: false,
    }),
  ],
  build: {
    minify: "terser",
  },
});
