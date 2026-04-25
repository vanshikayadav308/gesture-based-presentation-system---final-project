import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

/**
 * ✅ GUARANTEED: Serve the sample PDF directly (bypasses Vite + SPA routing)
 * Put the PDF file here:
 *   server/assets/sample_presentation_3_pages.pdf
 */
app.get("/sample_presentation_3_pages.pdf", (_req, res) => {
  const pdfPath = path.resolve(
    process.cwd(),
    "server",
    "assets",
    "sample_presentation_3_pages.pdf",
  );

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send("Sample PDF not found on server. Expected at: server/assets/sample_presentation_3_pages.pdf");
  }

  res.setHeader("Content-Type", "application/pdf");
  return res.sendFile(pdfPath);
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // Setup vite only in development, and after registering other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  // Replit/containers need 0.0.0.0, local macOS should use 127.0.0.1
  const isHosted =
    Boolean(process.env.REPL_ID) ||
    Boolean(process.env.CODESPACES) ||
    Boolean(process.env.DOCKER);

  const host = isHosted ? "0.0.0.0" : "127.0.0.1";

  // reusePort can cause ENOTSUP on macOS; only enable in hosted envs
  const listenOptions: { port: number; host: string; reusePort?: boolean } =
    isHosted ? { port, host, reusePort: true } : { port, host };

  httpServer.listen(listenOptions, () => {
    log(`serving on http://${host}:${port}`);
    log(`sample pdf: http://${host}:${port}/sample_presentation_3_pages.pdf`);
  });
})();
