import { build, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
