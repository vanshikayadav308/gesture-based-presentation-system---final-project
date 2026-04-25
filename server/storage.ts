import { db, hasDb } from "./db";
import {
  presentations,
  type Presentation,
  type InsertPresentation,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPresentations(): Promise<Presentation[]>;
  getPresentation(id: number): Promise<Presentation | undefined>;
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
}

/** ✅ Database-backed storage (only when DATABASE_URL exists) */
export class DatabaseStorage implements IStorage {
  async getPresentations(): Promise<Presentation[]> {
    if (!db) return [];
    return await db.select().from(presentations);
  }

  async getPresentation(id: number): Promise<Presentation | undefined> {
    if (!db) return undefined;
    const [presentation] = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, id));
    return presentation;
  }

  async createPresentation(
    insertPresentation: InsertPresentation,
  ): Promise<Presentation> {
    if (!db) {
      // Should never happen if hasDb=true, but keep it safe
      return {
        id: Date.now(),
        ...insertPresentation,
      } as Presentation;
    }

    const [presentation] = await db
      .insert(presentations)
      .values(insertPresentation)
      .returning();
    return presentation;
  }
}

/** ✅ In-memory storage for local prototype mode (no DB required) */
export class MemoryStorage implements IStorage {
  private items: Presentation[] = [];
  private nextId = 1;

  async getPresentations(): Promise<Presentation[]> {
    return this.items;
  }

  async getPresentation(id: number): Promise<Presentation | undefined> {
    return this.items.find((x) => x.id === id);
  }

  async createPresentation(
    insertPresentation: InsertPresentation,
  ): Promise<Presentation> {
    const created = {
      id: this.nextId++,
      ...insertPresentation,
    } as Presentation;

    this.items.unshift(created);
    return created;
  }
}

/** ✅ Export the correct storage depending on env */
export const storage: IStorage = hasDb ? new DatabaseStorage() : new MemoryStorage();
