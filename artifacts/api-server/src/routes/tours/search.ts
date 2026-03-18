import { Router, type IRouter } from "express";
import { searchLevelTravelTours, generateTourDescription } from "./leveltravel.js";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { departureCity, budget, adults = 2 } = req.body;

    if (!departureCity || typeof departureCity !== "string") {
      res.status(400).json({ error: "BAD_REQUEST", message: "departureCity is required" });
      return;
    }

    const budgetNum = Number(budget);
    if (!budgetNum || budgetNum <= 0) {
      res.status(400).json({ error: "BAD_REQUEST", message: "budget must be a positive number" });
      return;
    }

    const adultsNum = Math.max(1, Math.min(10, Number(adults) || 2));

    const { tours: rawTours, source } = await searchLevelTravelTours(departureCity, budgetNum, adultsNum);

    const topTours = rawTours.slice(0, 3);

    const toursWithDescriptions = [];
    for (let i = 0; i < topTours.length; i++) {
      const tour = topTours[i];
      const { aiDescription, aiRecommendation, aiProvider } = await generateTourDescription(
        tour,
        departureCity,
        tour.nights,
        i
      );
      toursWithDescriptions.push({
        ...tour,
        aiDescription,
        aiRecommendation,
        aiProvider,
      });
    }

    res.json({
      tours: toursWithDescriptions,
      searchId: Date.now().toString(),
      departureCity,
      budget: budgetNum,
      totalFound: rawTours.length,
      dataSource: source,
    });
  } catch (err) {
    console.error("Tour search error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to search tours" });
  }
});

export default router;
