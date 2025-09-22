import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      tailwindcss(),
      dts({
        entryRoot: "src",
        outDir: "types",
        tsconfigPath: "./tsconfig.json",
        compilerOptions: {
          skipDiagnostics: false,
          logDiagnostics: true,
        }
      }),
    ],
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
    },
    build: {
      sourcemap: mode === "development",
      lib: {
        entry: "src/index.ts",
        name: "RichTextEditor",
        fileName: "index",
        formats: ["es"],
      },
      outDir: "dist",
      copyPublicDir: false,
      minify: "esbuild" as const,
      cssMinify: true,
      rollupOptions: {
        output: [
          {
            intro: `import './index.css'`,
            format: "es" as const,
          },
        ],
        external: [
          "@tiptap/core",
          "@tiptap/extension-blockquote",
          "@tiptap/extension-bold",
          "@tiptap/extension-bullet-list",
          "@tiptap/extension-code",
          "@tiptap/extension-code-block-lowlight",
          "@tiptap/extension-color",
          "@tiptap/extension-document",
          "@tiptap/extension-dropcursor",
          "@tiptap/extension-gapcursor",
          "@tiptap/extension-hard-break",
          "@tiptap/extension-heading",
          "@tiptap/extension-highlight",
          "@tiptap/extension-image",
          "@tiptap/extension-italic",
          "@tiptap/extension-link",
          "@tiptap/extension-list-item",
          "@tiptap/extension-ordered-list",
          "@tiptap/extension-paragraph",
          "@tiptap/extension-strike",
          "@tiptap/extension-subscript",
          "@tiptap/extension-superscript",
          "@tiptap/extension-table",
          "@tiptap/extension-table-cell",
          "@tiptap/extension-table-header",
          "@tiptap/extension-table-row",
          "@tiptap/extension-text",
          "@tiptap/extension-text-align",
          "@tiptap/extension-text-style",
          "@tiptap/extension-underline",
          "@tiptap/pm",
        ],
      },
    },
    server: {
      port: 3001,
    },
  };
});
