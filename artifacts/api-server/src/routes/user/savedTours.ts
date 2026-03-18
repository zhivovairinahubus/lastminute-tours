import { Router, type Request } from "express";
import { db, savedToursTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getUserId(req: Request): string | null {
  if (!req.isAuthenticated()) return null;
  return (req.user as { id: string }).id ?? null;
}

router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const tours = await db
      .select()
      .from(savedToursTable)
      .where(eq(savedToursTable.userId, userId))
      .orderBy(savedToursTable.savedAt);
    res.json({ savedTours: tours });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch saved tours" });
  }
});

router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { tourId, tourData } = req.body;
  if (!tourId || !tourData) {
    res.status(400).json({ error: "tourId and tourData required" });
    return;
  }
  try {
    await db
      .insert(savedToursTable)
      .values({ userId, tourId, tourData })
      .onConflictDoNothing();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save tour" });
  }
});

router.delete("/:tourId", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { tourId } = req.params;
  try {
    await db
      .delete(savedToursTable)
      .where(
        and(
          eq(savedToursTable.userId, userId),
          eq(savedToursTable.tourId, tourId)
        )
      );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete saved tour" });
  }
});

export default router;
