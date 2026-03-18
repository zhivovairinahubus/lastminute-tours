import { Router, type Request } from "express";
import { db, searchHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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
    const history = await db
      .select()
      .from(searchHistoryTable)
      .where(eq(searchHistoryTable.userId, userId))
      .orderBy(desc(searchHistoryTable.searchedAt))
      .limit(20);
    res.json({ searchHistory: history });
  } catch {
    res.status(500).json({ error: "Failed to fetch search history" });
  }
});

export default router;
