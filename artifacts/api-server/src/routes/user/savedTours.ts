import { Router, type Request } from "express";
import { z } from "zod";
import { db, savedToursTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const TourDataSchema = z.object({
  id: z.string().max(200).optional(),
  hotel: z.string().max(500),
  destination: z.string().max(500),
  country: z.string().max(200),
  city: z.string().max(200),
  stars: z.number().int().min(1).max(7),
  departureDate: z.string().max(50),
  returnDate: z.string().max(50).optional(),
  nights: z.number().int().min(1).max(90),
  price: z.number().min(0).max(10_000_000),
  totalPrice: z.number().min(0).max(100_000_000),
  mealType: z.string().max(200),
  imageUrl: z.string().url().max(2000).optional(),
  bookingUrl: z.string().url().max(2000).optional(),
  aiDescription: z.string().max(5000).optional(),
  aiRecommendation: z.string().max(500).optional(),
});

const SaveTourBody = z.object({
  tourId: z.string().min(1).max(200),
  tourData: TourDataSchema,
});

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
  } catch {
    res.status(500).json({ error: "Failed to fetch saved tours" });
  }
});

router.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = SaveTourBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tour data", details: parsed.error.flatten() });
    return;
  }

  const { tourId, tourData } = parsed.data;
  try {
    await db
      .insert(savedToursTable)
      .values({ userId, tourId, tourData })
      .onConflictDoNothing();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to save tour" });
  }
});

router.delete("/:tourId", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const tourId = req.params.tourId;
  if (!tourId || tourId.length > 200) {
    res.status(400).json({ error: "Invalid tourId" });
    return;
  }
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
  } catch {
    res.status(500).json({ error: "Failed to delete saved tour" });
  }
});

export default router;
