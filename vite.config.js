import { defineConfig } from "vite";
import path, { resolve } from "path";
import fs from "fs";
import handlebars from "vite-plugin-handlebars";

function aliasRedirect(map) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    const [pathname, q = ""] = (req.url || "").split("?");
    const to = map[pathname];
    if (to) {
      res.statusCode = 302;
      res.setHeader("Location", to + (q ? "?" + q : ""));
      return res.end();
    }
    next();
  };
}

// redirect "/foo" -> "/foo/" kalau ada folder index.html
function slashForFolders(rootRel) {
  const base = path.resolve(process.cwd(), rootRel);
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    const [pathname, q = ""] = (req.url || "").split("?");
    if (!pathname || pathname === "/" || pathname.endsWith("/") || pathname.endsWith(".html")) {
      return next();
    }
    const candidate = path.join(base, "." + pathname, "index.html");
    if (fs.existsSync(candidate)) {
      res.statusCode = 301;
      res.setHeader("Location", pathname + "/" + (q ? "?" + q : ""));
      return res.end();
    }
    next();
  };
}

export default defineConfig({
  root: "src",
  appType: "mpa",
  envDir: process.cwd(),
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    outDir: "../dist",
    emptyOutDir: true, 
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.html"),
        login: path.resolve(__dirname, "src/auth/login/index.html"),
        user: path.resolve(__dirname, "src/user/index.html"),
        notFound: path.resolve(__dirname, "src/404.html"),
      },
    },
  },
  preview: { port: 8000 },
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
      context: (pagePath) => {
        const titles = {
          '/index.html': 'Home Page',
          '/user/index.html': 'Daftar User',
        };
        return {
          title: titles[pagePath] || 'Asset Management',
        };
      },
      reloadOnPartialChange: false, // optional: avoids full reload on partial updates
    }),
    {
      name: "routes",
      configureServer(server) {
        server.middlewares.use(slashForFolders("src"));
        server.middlewares.use(aliasRedirect({
          "/login": "/auth/login/",
          "/not-found": "/404.html",
        }));
      },
      configurePreviewServer(server) {
        server.middlewares.use(slashForFolders("dist"));
        server.middlewares.use(aliasRedirect({
          "/login": "/auth/login/",
          "/not-found": "/404.html", 
        }));
      },
    },
  ],
});
