import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Calda",
      formats: ["umd", "es"],
      fileName: (format) => {
        if (format === "umd") return "sdk.umd.js";
        return "index.mjs";
      },
    },
    assetsInlineLimit: 100000,
    minify: "esbuild",
    sourcemap: true,
  },
});
