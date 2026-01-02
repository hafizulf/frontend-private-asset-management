import { defineConfig } from "vite";
import path, { resolve } from "path";
import fs from "fs";
import handlebars from "vite-plugin-handlebars";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function resolveHtmlCandidate(rootAbs, pathname) {
  const p = (pathname || "/").split("?")[0];
  if (p === "/" || p === "/index.html") {
    const f = path.join(rootAbs, "index.html");
    return fs.existsSync(f) ? f : null;
  }
  if (p.endsWith(".html")) {
    const f = path.join(rootAbs, p.replace(/^\//, "")); // /404.html -> <root>/404.html
    return fs.existsSync(f) ? f : null;
  }
  if (p.endsWith("/")) {
    const f = path.join(rootAbs, p.replace(/^\//, ""), "index.html"); // /user/ -> <root>/user/index.html
    return fs.existsSync(f) ? f : null;
  }
  return null; // not an HTML route; let other middleware handle (assets etc.)
}

function addDevNotFound(server) {
  const rootAbs = path.resolve(__dirname, "src");
  const notFoundAbs = path.resolve(rootAbs, "404.html");

  server.middlewares.use((req, res, next) => {
    if (req.method !== "GET") return next();

    const pathname = (req.url || "").split("?")[0];

    // ignore Vite internals & non-HTML assets
    const ext = path.extname(pathname);
    if ((ext && ext !== ".html") || pathname.startsWith("/@")) return next();

    const candidate = resolveHtmlCandidate(rootAbs, pathname);
    if (candidate) return next();

    // serve transformed 404 so partials work in dev
    const raw = fs.readFileSync(notFoundAbs, "utf-8");
    server
      .transformIndexHtml("/404.html", raw)
      .then((html) => {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      })
      .catch(() => {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html");
        res.end(raw);
      });
  });
}

function addPreviewNotFound(server) {
  const rootAbs = path.resolve(__dirname, "dist");
  const notFoundAbs = path.resolve(rootAbs, "404.html");

  server.middlewares.use((req, res, next) => {
    if (req.method !== "GET") return next();

    const pathname = (req.url || "").split("?")[0];

    const ext = path.extname(pathname);
    if ((ext && ext !== ".html") || pathname.startsWith("/@")) return next();

    const candidate = resolveHtmlCandidate(rootAbs, pathname);
    if (candidate) return next();

    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html");
    res.end(fs.readFileSync(notFoundAbs, "utf-8"));
  });
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
        buyHistories: path.resolve(__dirname, "src/buy-histories/index.html"),
        sellHistories: path.resolve(__dirname, "src/sell-histories/index.html"),
        commodities: path.resolve(__dirname, "src/commodities/index.html"),
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
          '/buy-histories/index.html': 'Riwayat Pembelian',
          '/sell-histories/index.html': 'Riwayat Penjualan',
          '/commodities/index.html': 'Daftar Komoditas',
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
        addDevNotFound(server);
      },
      configurePreviewServer(server) {
        server.middlewares.use(slashForFolders("dist"));
        server.middlewares.use(aliasRedirect({
          "/login": "/auth/login/",
          "/not-found": "/404.html", 
        }));
        addPreviewNotFound(server);
      },
    },
  ],
});
