import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isGigaChatConfigured } from "../../lib/gigachat.js";

const router: IRouter = Router();

const ALLOWED_KEYS = [
  "GIGACHAT_KEY",
  "LEVEL_TRAVEL_TOKEN",
  "ADMIN_PASSWORD",
];

router.get("/", async (_req, res) => {
  try {
    const settings = await db.select({
      key: settingsTable.key,
      updatedAt: settingsTable.updatedAt,
    }).from(settingsTable);

    const settingsMap: Record<string, { hasValue: boolean; updatedAt: Date }> = {};
    for (const s of settings) {
      if (ALLOWED_KEYS.includes(s.key)) {
        settingsMap[s.key] = {
          hasValue: true,
          updatedAt: s.updatedAt,
        };
      }
    }
    res.json({ settings: settingsMap });
  } catch (err) {
    console.error("Settings GET error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load settings" });
  }
});

router.put("/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!ALLOWED_KEYS.includes(key)) {
    res.status(400).json({ error: "INVALID_KEY", message: `Key '${key}' is not allowed` });
    return;
  }

  if (typeof value !== "string" || !value.trim()) {
    res.status(400).json({ error: "BAD_REQUEST", message: "value must be a non-empty string" });
    return;
  }

  try {
    await db
      .insert(settingsTable)
      .values({ key, value: value.trim() })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: value.trim(), updatedAt: new Date() },
      });

    res.json({ success: true, key });
  } catch (err) {
    console.error("Settings PUT error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to save setting" });
  }
});

router.delete("/:key", async (req, res) => {
  const { key } = req.params;

  if (!ALLOWED_KEYS.includes(key)) {
    res.status(400).json({ error: "INVALID_KEY", message: `Key '${key}' is not allowed` });
    return;
  }

  try {
    await db.delete(settingsTable).where(eq(settingsTable.key, key));
    res.json({ success: true, key });
  } catch (err) {
    console.error("Settings DELETE error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete setting" });
  }
});

router.get("/status", async (_req, res) => {
  try {
    const [gigachatConfigured, settings] = await Promise.all([
      isGigaChatConfigured(),
      db.select().from(settingsTable),
    ]);
    const map = Object.fromEntries(settings.map((s) => [s.key, !!s.value]));
    res.json({
      gigachat: gigachatConfigured,
      levelTravel: !!(map["LEVEL_TRAVEL_TOKEN"] || process.env.LEVEL_TRAVEL_TOKEN),
    });
  } catch {
    res.json({ gigachat: false, levelTravel: false });
  }
});

export default router;
