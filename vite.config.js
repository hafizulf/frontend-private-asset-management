import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        index: 'src/index.html',
        example: 'src/example.html'
      }
    }
  },
  preview: {
    port: 8000
  }
});
