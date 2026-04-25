import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { hasDb } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.presentations.list.path, async (req, res) => {
    const list = await storage.getPresentations();
    res.json(list);
  });

  app.get(api.presentations.get.path, async (req, res) => {
    const item = await storage.getPresentation(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Presentation not found" });
    }
    res.json(item);
  });

  app.post(api.presentations.create.path, async (req, res) => {
    try {
      const input = api.presentations.create.input.parse(req.body);
      const item = await storage.createPresentation(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  // ✅ Seed AFTER routes are registered, and only once at startup
  seed().catch(console.error);

  return httpServer;
}

// ✅ Seed function to add a sample presentation
async function seed() {
  const existing = await storage.getPresentations();
  if (existing.length > 0) return;

  // Use your 3-page local sample (put it in /public)
  await storage.createPresentation({
    title: "Gesture Control Guide (Sample Deck)",
    url: "/sample_presentation_3_pages.pdf",
  });

  console.log(
    `[INFO] Seeded sample presentation (${hasDb ? "DB" : "memory"} mode).`
  );
}
