import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

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
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.html"),
        login: path.resolve(__dirname, "src/auth/login/index.html"),
        test:  path.resolve(__dirname, "src/test/index.html"),
        notFound: path.resolve(__dirname, "src/404.html"),
      },
    },
  },
  preview: { port: 8000 },
  plugins: [
    {
      name: "routes",
      configureServer(server) {
        server.middlewares.use(slashForFolders("src"));
        server.middlewares.use(aliasRedirect({
          "/login": "/auth/login/",
          "/test": "/test/",
          "/not-found": "/404.html",
        }));
      },
      configurePreviewServer(server) {
        server.middlewares.use(slashForFolders("dist"));
        server.middlewares.use(aliasRedirect({
          "/login": "/auth/login/",
          "/test": "/test/",
          "/not-found": "/404.html", 
        }));
      },
    },
  ],
});
