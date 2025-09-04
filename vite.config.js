import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "src",
  envDir: process.cwd(),
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: path.resolve(__dirname, "src/auth/login.html"),
        index: path.resolve(__dirname, "src/index.html"),
      }
    }
  },
  preview: {
    port: 8000
  },
  plugins: [
    {
      name: "auth-guard",
      transformIndexHtml(html, ctx) {
        // 1) Hard exclude by filename to avoid any regex edge cases
        if (ctx?.filename?.endsWith("/src/auth/login.html")) return html;

        // 2) Also support the public-page meta flag
        const isPublic = /<meta\s+name=["']public-page["']\s+content=["']true["']\s*\/?>/i.test(html);
        if (isPublic) return html;

        return {
          html,
          tags: [
            {
              tag: "script",
              attrs: { type: "module", src: "/assets/javascript/guard.ts" },
              injectTo: "body",
            },
          ],
        };
      },
    },
  ],
});
