import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPresentationSchema = createInsertSchema(presentations).omit({ 
  id: true, 
  createdAt: true 
});

export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
