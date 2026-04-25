import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const publicPath = path.resolve(process.cwd(), "public");

  // 1️⃣ Serve static assets (PDFs, images, etc.)
  app.use(express.static(publicPath));

  // 2️⃣ SPA fallback ONLY for non-file routes
  app.use((req, res, next) => {
    // If the request has a file extension, skip SPA fallback
    if (path.extname(req.path)) {
      return next();
    }

    res.sendFile(path.join(publicPath, "index.html"));
  });
}
